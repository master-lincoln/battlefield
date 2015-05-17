define('gridlib/diagram', [
	'gridlib/screen_coordinate',
	'gridlib/grid'
], function (
	ScreenCoordinate,
	Grid
) {
	'use strict';

	var Diagram = function(controller, svg, scale, hexes_collection, cubes) {
		this.controller = controller;
		this.svg = svg;
		this.scale = scale;
		this.root = svg.append('g');
		this.cubes = cubes;
		this.orientation = true;

		this.hexes_collection = hexes_collection;

		this.initialize();
	};

	Diagram.prototype.animateMovement = function(path, callback) {
		callback();
	};

	Diagram.prototype.initialize = function() {
		var hexes = [],
			cubes = this.cubes,
			hexagon_points = this.makeHexagonShape(this.scale);

		for(var i = 0, l = cubes.length; i < l; i++) {
			var cube = cubes[i];
			var tile = this.root.append('g').attr('class', "tile").attr('x', cube.x).attr('y', cube.y).attr('z', cube.z);
			var polygon = tile.append('polygon').attr('points', hexagon_points);
			var label = tile.append('text').attr('y', "0.4em");

			hexes.push({
				cube : cube,
				tile : tile,
				polygon : polygon,
				label : label
			});
		}

		this.hexes_collection.addHexes(hexes, true);

		this.update(this.scale, true);
	};

	/**
	 * The shape of a hexagon is adjusted by the scale; the rotation is handled elsewhere, using svg transforms
	 *
	 * @param scale
	 * @returns {string}
	 */
	Diagram.prototype.makeHexagonShape = function(scale) {
		return this.hexToPolygon(scale, 0, 0, false).map(function(screen_coordinate) {
			return screen_coordinate.x.toFixed(3) + "," + screen_coordinate.y.toFixed(3);
		}).join(" ");
	};

	/**
	 * (x, y) should be the center
	 * scale should be the distance from corner to corner
	 * orientation should be 0 (flat bottom hex) or 1 (flat side hex)
	 */
	Diagram.prototype.hexToPolygon = function(scale, x, y, orientation) {
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
	};

	Diagram.prototype.enablePath = function() {
		this.pathLayer = this.root.append('path')
			.attr('d', "M 0 0")
			.attr('class', "path");

		this.setPath = function(path) {
			var d = [];

			for (var i = 0; i < path.length; i++) {
				d.push(i == 0 ? 'M' : 'L');
				d.push(this.grid.hexToCenter(path[i]));
			}

			this.pathLayer.attr('d', d.join(" "));
		};
	};

	Diagram.prototype.addCubeCoordinates = function(/*with_mouseover*/) {
		var hexes = this.hexes_collection.getHexes();

		for(var i = 0, l = hexes.length; i < l; i++) {
			var hex = hexes[i];
			var cube = hex.getCube();
			var label = hex.getLabel();
			var labels = [cube.x, cube.y, cube.z];

			if (labels[0] == 0 && labels[1] == 0 && labels[2] == 0) {
				// Special case: label the origin with x/y/z so that you can tell where things to
				labels = ['x', 'y', 'z'];
			}

			label.append('tspan').attr('class', "q").text(labels[0] + ', ');
			label.append('tspan').attr('class', "s").text(labels[1] + ', ');
			label.append('tspan').attr('class', "r").text(labels[2]);
		}

		//Code to live update cubes
		/*function relocate() {
			var BL = 4;  // adjust to vertically center
			var offsets = diagram.orientation? [14, -9+BL, -14, -9+BL, 0, 13+BL] : [13, 0+BL, -9, -14+BL, -9, 14+BL];
			offsets = offsets.map(function(f) { return f * diagram.scale / 50; });
			diagram.tiles.select(".q").attr('x', offsets[0]).attr('y', offsets[1]);
			diagram.tiles.select(".s").attr('x', offsets[2]).attr('y', offsets[3]);
			diagram.tiles.select(".r").attr('x', offsets[4]).attr('y', offsets[5]);
		}
		diagram.onUpdate(relocate);*/
	};

	Diagram.prototype.update = function(scale, orientation) {
		var hexes = this.hexes_collection.getHexes();

		this.orientation = orientation;

		var grid = this.grid = new Grid(scale, orientation, hexes.map(function(hex) {
			return hex.getCube();
		}));

		var bounds = grid.bounds();

		// NOTE: In Webkit I can use svg.node().clientWidth but in Gecko that returns 0 :(
		var translate = new ScreenCoordinate(
			(parseFloat(this.svg.attr('width')) - bounds.minX - bounds.maxX) / 2,
			(parseFloat(this.svg.attr('height')) - bounds.minY - bounds.maxY) / 2
		);

		this.root.attr('transform', "translate(" + translate + ")");

		for(var i = 0, l = hexes.length; i < l; i++) {
			var hex = hexes[i];
			var center = grid.hexToCenter(hex.getCube());

			hex.getTile().attr('transform', "translate(" + center.x + "," + center.y + ")");
			hex.getPolygon().attr('transform', "rotate(" + (orientation * -30) + ")");
		}
	};

	Diagram.prototype.updateCssClasses = function(bfs) {
		var hexes = this.hexes_collection.getHexes(),
			distance_limit = this.controller.getDistanceLimit(),
			starting_point = this.controller.getStartingPoint(),
			destination_point = this.controller.getDestinationPoint();

		for (var i = 0, l = hexes.length; i < l; i++) {
			var hex = hexes[i],
				cube = hex.getCube();

			hex.getTile().classed({
				'blocked' : this.controller.isHexBlocked(cube),
				'shadow' : !bfs.cost_so_far.has(cube) || bfs.cost_so_far.get(cube) > distance_limit,
				'start' : cube.x === starting_point.x && cube.y === starting_point.y && cube.z === starting_point.z,
				'goal' : cube.equals(destination_point)
			});
		}
	};

	Diagram.prototype.addHexCoordinates = function(converter, with_mouseover) {
		/*diagram.nodes.forEach(function (n) {
			n.hex = converter(n.cube);
		});

		diagram.tiles.append('text')
			.attr('y', "0.4em")
			.each(function(d) {
				var selection = d3.select(this);
				selection.append('tspan').attr('class', "q").text(d.hex.q);
				selection.append('tspan').text(", ");
				selection.append('tspan').attr('class', "r").text(d.hex.r);
			});

		function setSelection(hex) {
			diagram.tiles
				.classed('q-axis-same', function(other) {
					return hex.q == other.hex.q;
				})
				.classed('r-axis-same', function(other) {
					return hex.r == other.hex.r;
				});
		}

		if (with_mouseover) {
			diagram.tiles
				.on('mouseover', function(d) {
					setSelection(d.hex);
				})
				.on('touchstart', function(d) {
					setSelection(d.hex);
				});
		}

		return diagram;*/
	};

	return Diagram;
});