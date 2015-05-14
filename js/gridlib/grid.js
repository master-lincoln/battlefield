(function() {
	'use strict';

	var Grid = function(scale,orientation,shape) {
		this.scale = scale;
		this.orientation = orientation;
		this.hexes = shape;
	};

	Grid.SQRT_3_2 = Math.sqrt(3) / 2;

	Grid.boundsOfPoints = function(points) {
		var minX = 0.0;
		var minY = 0.0;
		var maxX = 0.0;
		var maxY = 0.0;
		var _g = 0;

		while(_g < points.length) {
			var p = points[_g];
			++_g;
			if(p.x < minX) {minX = p.x};
			if(p.x > maxX) {maxX = p.x};
			if(p.y < minY) {minY = p.y};
			if(p.y > maxY) {maxY = p.y};
		}
		return { minX : minX, maxX : maxX, minY : minY, maxY : maxY};
	};

	Grid.twoAxisToCube = function(hex) {
		return new Cube(hex.q,-hex.r - hex.q,hex.r);
	};

	Grid.cubeToTwoAxis = function(cube) {
		return new Hex(cube.x | 0,cube.z | 0);
	};

	Grid.oddQToCube = function(hex) {
		var x = hex.q;
		var z = hex.r - (hex.q - (hex.q & 1) >> 1);
		return new Cube(x,-x - z,z);
	};

	Grid.cubeToOddQ = function(cube) {
		var x = cube.x | 0;
		var z = cube.z | 0;
		return new Hex(x,z + (x - (x & 1) >> 1));
	};

	Grid.evenQToCube = function(hex) {
		var x = hex.q;
		var z = hex.r - (hex.q + (hex.q & 1) >> 1);
		return new Cube(x,-x - z,z);
	};

	Grid.cubeToEvenQ = function(cube) {
		var x = cube.x | 0;
		var z = cube.z | 0;
		return new Hex(x,z + (x + (x & 1) >> 1));
	};

	Grid.oddRToCube = function(hex) {
		var z = hex.r;
		var x = hex.q - (hex.r - (hex.r & 1) >> 1);
		return new Cube(x,-x - z,z);
	};

	Grid.cubeToOddR = function(cube) {
		var x = cube.x | 0;
		var z = cube.z | 0;
		return new Hex(x + (z - (z & 1) >> 1),z);
	};

	Grid.evenRToCube = function(hex) {
		var z = hex.r;
		var x = hex.q - (hex.r + (hex.r & 1) >> 1);
		return new Cube(x,-x - z,z);
	};

	Grid.cubeToEvenR = function(cube) {
		var x = cube.x | 0;
		var z = cube.z | 0;
		return new Hex(x + (z + (z & 1) >> 1),z);
	};

	Grid.trapezoidalShape = function(minQ,maxQ,minR,maxR,toCube) {
		var hexes = [];
		var _g1 = minQ;
		var _g = maxQ + 1;
		while(_g1 < _g) {
			var q = _g1++;
			var _g3 = minR;
			var _g2 = maxR + 1;
			while(_g3 < _g2) {
				var r = _g3++;
				hexes.push(toCube(new Hex(q,r)));
			}
		}
		return hexes;
	};

	Grid.triangularShape = function(size) {
		var hexes = [];
		var _g1 = 0;
		var _g = size + 1;
		while(_g1 < _g) {
			var k = _g1++;
			var _g3 = 0;
			var _g2 = k + 1;
			while(_g3 < _g2) {
				var i = _g3++;
				hexes.push(new Cube(i,-k,k - i));
			}
		}
		return hexes;
	};

	Grid.hexagonalShape = function(size) {
		var hexes = [];
		var _g1 = -size;
		var _g = size + 1;
		while(_g1 < _g) {
			var x = _g1++;
			var _g3 = -size;
			var _g2 = size + 1;
			while(_g3 < _g2) {
				var y = _g3++;
				var z = -x - y;
				if(Math.abs(x) <= size && Math.abs(y) <= size && Math.abs(z) <= size) hexes.push(new Cube(x,y,z));
			}
		}
		return hexes;
	};

	Grid.prototype = {
		hexToCenter: function(cube) {
			var s;
			var size = this.scale / 2;
			if(this.orientation) s = new ScreenCoordinate(Math.sqrt(3) * cube.x + Math.sqrt(3) / 2 * cube.z,1.5 * cube.z); else s = new ScreenCoordinate(1.5 * cube.x,Math.sqrt(3) / 2 * cube.x + Math.sqrt(3) * cube.z);
			return s.scale(size);
		}
		,cartesianToHex: function(p) {
			var size = this.scale / 2;
			p = p.scale(1 / size);
			if(this.orientation) {
				var q = Math.sqrt(3) / 3 * p.x + -0.333333333333333315 * p.y;
				var r = 0.66666666666666663 * p.y;
				return new FractionalCube(q,-q - r,r);
			} else {
				var q1 = 0.66666666666666663 * p.x;
				var r1 = -0.333333333333333315 * p.x + Math.sqrt(3) / 3 * p.y;
				return new FractionalCube(q1,-q1 - r1,r1);
			}
		}
		,bounds: function() {
			var _g = this;
			var centers = Lambda.array(this.hexes.map(function(hex) {
				return _g.hexToCenter(hex);
			}));
			var b1 = Grid.boundsOfPoints(this.polygonVertices());
			var b2 = Grid.boundsOfPoints(centers);
			return { minX : b1.minX + b2.minX, maxX : b1.maxX + b2.maxX, minY : b1.minY + b2.minY, maxY : b1.maxY + b2.maxY};
		}
		,polygonVertices: function() {
			var points = [];
			var _g = 0;
			while(_g < 6) {
				var i = _g++;
				var angle;
				angle = 2 * Math.PI * (2 * i - (this.orientation?1:0)) / 12;
				points.push(new ScreenCoordinate(0.5 * this.scale * Math.cos(angle),0.5 * this.scale * Math.sin(angle)));
			}
			return points;
		}
	};

	window.Grid = Grid;
}());
