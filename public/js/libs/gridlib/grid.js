define('gridlib/grid', [
	'gridlib/cube',
	'gridlib/fractional_cube',
	'gridlib/hex',
	'gridlib/screen_coordinate',
	'gridlib/lambda',
], function(
	Cube,
	FractionalCube,
	Hex,
	ScreenCoordinate,
	Lambda
) {
	'use strict';

	var Grid = function(scale, orientation, shape) {
		this.scale = scale;
		this.orientation = orientation;
		this.hexes = shape;
	};

	Grid.SQRT_3_2 = Math.sqrt(3) / 2;

	Grid.boundsOfPoints = function(points) {
		var min_x = 0.0;
		var min_y = 0.0;
		var max_x = 0.0;
		var max_y = 0.0;
		var i = 0;

		while(i < points.length) {
			var p = points[i];
			++i;

			if (p.x < min_x) {min_x = p.x;}
			if (p.x > max_x) {max_x = p.x;}
			if (p.y < min_y) {min_y = p.y;}
			if (p.y > max_y) {max_y = p.y;}
		}
		return {
			minX : min_x,
			maxX : max_x,
			minY : min_y,
			maxY : max_y
		};
	};

	Grid.twoAxisToCube = function(hex) {
		return new Cube(hex.q, -hex.r - hex.q, hex.r);
	};

	Grid.cubeToTwoAxis = function(cube) {
		return new Hex(cube.x | 0, cube.z | 0);
	};

	Grid.oddQToCube = function(hex) {
		var x = hex.q;
		var z = hex.r - (hex.q - (hex.q & 1) >> 1);

		return new Cube(x, -x - z, z);
	};

	Grid.cubeToOddQ = function(cube) {
		var x = cube.x | 0;
		var z = cube.z | 0;

		return new Hex(x, z + (x - (x & 1) >> 1));
	};

	Grid.evenQToCube = function(hex) {
		var x = hex.q;
		var z = hex.r - (hex.q + (hex.q & 1) >> 1);

		return new Cube(x, -x - z, z);
	};

	Grid.cubeToEvenQ = function(cube) {
		var x = cube.x | 0;
		var z = cube.z | 0;

		return new Hex(x, z + (x + (x & 1) >> 1));
	};

	Grid.oddRToCube = function(hex) {
		var z = hex.r;
		var x = hex.q - (hex.r - (hex.r & 1) >> 1);

		return new Cube(x, -x - z,z);
	};

	Grid.cubeToOddR = function(cube) {
		var x = cube.x | 0;
		var z = cube.z | 0;

		return new Hex(x + (z - (z & 1) >> 1), z);
	};

	Grid.evenRToCube = function(hex) {
		var z = hex.r;
		var x = hex.q - (hex.r + (hex.r & 1) >> 1);

		return new Cube(x, -x - z, z);
	};

	Grid.cubeToEvenR = function(cube) {
		var x = cube.x | 0;
		var z = cube.z | 0;

		return new Hex(x + (z + (z & 1) >> 1), z);
	};

	Grid.trapezoidalShape = function(min_q, max_q, min_r, max_r, toCube) {
		var hexes = [];
		var g1 = min_q;
		var g = max_q + 1;

		while(g1 < g) {
			var q = g1++;
			var g3 = min_r;
			var g2 = max_r + 1;

			while(g3 < g2) {
				var r = g3++;
				hexes.push(toCube(new Hex(q, r)));
			}
		}

		return hexes;
	};

	Grid.triangularShape = function(size) {
		var hexes = [];
		var g1 = 0;
		var g = size + 1;

		while(g1 < g) {
			var k = g1++;
			var g3 = 0;
			var g2 = k + 1;

			while(g3 < g2) {
				var i = g3++;
				hexes.push(new Cube(i, -k, k - i));
			}
		}

		return hexes;
	};

	Grid.hexagonalShape = function(size) {
		var hexes = [];
		var g1 = -size;
		var g = size + 1;

		while(g1 < g) {
			var x = g1++;
			var g3 = -size;
			var g2 = size + 1;

			while(g3 < g2) {
				var y = g3++;
				var z = -x - y;

				if (Math.abs(x) <= size && Math.abs(y) <= size && Math.abs(z) <= size) {
					hexes.push(new Cube(x, y, z));
				}
			}
		}

		return hexes;
	};

	Grid.prototype = {
		/**
		 * @param {Number} x   (x, y) should be the center
		 * @param {Number} y   (x, y) should be the center
		 */
		hexToPolygon : function hexToPolygon(x, y) {
			var scale = this.scale;
			var orientation = this.orientation;

			// NOTE: the article says to use angles 0..300 or 30..330 (e.g. I
			// add 30 degrees for pointy top) but I instead use -30..270
			// (e.g. I subtract 30 degrees for pointy top) because it better
			// matches the animations I needed for my diagrams. They're
			// equivalent.
			var points = [];

			for (var i = 0; i < 6; i++) {
				var angle = 2 * Math.PI * (2 * i - orientation) / 12;

				points.push(new ScreenCoordinate(
					x + 0.5 * scale * Math.cos(angle),
					y + 0.5 * scale * Math.sin(angle)
				));
			}

			return points;
		},

		hexToCenter : function(cube) {
			var s;
			var size = this.scale / 2;

			if (this.orientation) {
				s = new ScreenCoordinate(Math.sqrt(3) * cube.x + Math.sqrt(3) / 2 * cube.z, 1.5 * cube.z);
			} else {
				s = new ScreenCoordinate(1.5 * cube.x, Math.sqrt(3) / 2 * cube.x + Math.sqrt(3) * cube.z);
			}

			return s.scale(size);
		},

		cartesianToHex : function(p) {
			var size = this.scale / 2;

			p = p.scale(1 / size);

			if (this.orientation) {
				var q = Math.sqrt(3) / 3 * p.x + -0.333333333333333315 * p.y;
				var r = 0.66666666666666663 * p.y;

				return new FractionalCube(q, -q - r, r);
			} else {
				var q1 = 0.66666666666666663 * p.x;
				var r1 = -0.333333333333333315 * p.x + Math.sqrt(3) / 3 * p.y;

				return new FractionalCube(q1, -q1 - r1, r1);
			}
		},

		bounds : function() {
			var g = this;
			var centers = Lambda.array(this.hexes.map(function(hex) {
				return g.hexToCenter(hex);
			}));
			var b1 = Grid.boundsOfPoints(this.polygonVertices());
			var b2 = Grid.boundsOfPoints(centers);

			return {
				minX : b1.minX + b2.minX,
				maxX : b1.maxX + b2.maxX,
				minY : b1.minY + b2.minY,
				maxY : b1.maxY + b2.maxY
			};
		},

		polygonVertices : function() {
			var points = [];
			var g = 0;

			while(g < 6) {
				var i = g++;
				var angle;

				angle = 2 * Math.PI * (2 * i - (this.orientation ? 1 : 0)) / 12;
				points.push(new ScreenCoordinate(0.5 * this.scale * Math.cos(angle), 0.5 * this.scale * Math.sin(angle)));
			}

			return points;
		}
	};

	return Grid;
});
