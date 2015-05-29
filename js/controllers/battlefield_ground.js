define('controller/battlefield_ground', [
	'controller/base',
	'view/battlefield_ground',
	'gridlib/screen_coordinate',
	'gridlib/grid',
	'gridlib/cube'
], function(
	BaseController,
	BattlefieldGroundView,
	ScreenCoordinate,
	Grid,
	Cube
) {
	return BaseController.extend({
		initialize : function(options) {
			BaseController.prototype.initialize.apply(this, arguments);

			this.svg = options.d3;
			this.root = this.svg.append('g');
			this.cubes = options.shape;
			this.orientation = true;
			this.hexes_collection = this.parent_controller.getCollection('hexes');


			this.createGroundCells();
			this.enablePath();
			//Add distance labels
			if (this.parent_controller.areDistanceLabelsEnabled()) {
				//this.addDistanceLabels(bfs);
				this.addCubeCoordinates();
			}

			this.initializeView();
		},

		initializeView : function() {
			this.view = new BattlefieldGroundView({
				el : this.$el,
				controller : this
			});

			this.view.render();
		},

		createGroundCells : function() {
			var hexes = [],
				scale = this.parent_controller.getScale(),
				cubes = this.cubes,
				hexagon_points = this.makeHexagonShape(scale);

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

			this.update(scale, true);
		},

		enablePath : function() {
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
		},

		addCubeCoordinates : function(/*with_mouseover*/) {
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
		},

		update : function(scale, orientation) {
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
		},

		updateCssClasses : function(bfs) {
			var hexes = this.hexes_collection.getHexes(),
				distance_limit = this.parent_controller.getDistanceLimit(),
				starting_point = this.parent_controller.getStartingPoint(),
				destination_point = this.parent_controller.getDestinationPoint();

			for (var i = 0, l = hexes.length; i < l; i++) {
				var hex = hexes[i],
					cube = hex.getCube();

				hex.getTile().classed({
					'blocked' : this.isHexBlocked(cube),
					'shadow' : !bfs.cost_so_far.has(cube) || bfs.cost_so_far.get(cube) > distance_limit,
					'start' : cube.x === starting_point.x && cube.y === starting_point.y && cube.z === starting_point.z,
					'goal' : cube.equals(destination_point)
				});
			}
		},

		/**
		 * (x, y) should be the center
		 * scale should be the distance from corner to corner
		 * orientation should be 0 (flat bottom hex) or 1 (flat side hex)
		 */
		hexToPolygon : function hexToPolygon(scale, x, y, orientation) {
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

		/**
		 * The shape of a hexagon is adjusted by the scale; the rotation is handled elsewhere, using svg transforms
		 *
		 * @param scale
		 * @returns {string}
		 */
		makeHexagonShape : function makeHexagonShape(scale) {
			return this.hexToPolygon(scale, 0, 0, false).map(function(screen_coordinate) {
				return screen_coordinate.x.toFixed(3) + "," + screen_coordinate.y.toFixed(3);
			}).join(" ");
		},

		isHexBlocked : function(cube) {
			var is_obstacle = this.parent_controller.getCollection('obstacles').isObstacle(cube);

			//Later we will check here whether unit is standing on this hex as well

			return is_obstacle;
		},

		getBFS : function() {
			return this.breadthFirstSearch(
				this.parent_controller.getStartingPoint(),
				this.parent_controller.getUnitSpeed(),
				this.parent_controller.getMaxDistance(),
				this.isHexBlocked.bind(this)
			);
		},

		/**
		 * @see http://www.redblobgames.com/pathfinding/a-star/introduction.html
		 *
		 * @param start
		 * @param maxMovement
		 * @param maxMagnitude
		 * @param isBlocked
		 * @returns {{cost_so_far: (Array|*), came_from: (Array|*)}}
		 */
		breadthFirstSearch : function(start, maxMovement, maxMagnitude, isBlocked) {
			var cost_so_far = d3.map();
			var came_from = d3.map();
			var fringes = [[start]];

			cost_so_far.set(start, 0);
			came_from.set(start, null);

			for (var k = 0; k < maxMovement && fringes[k].length > 0; k++) {
				fringes[k + 1] = [];
				fringes[k].forEach(function(cube) {
					for (var dir = 0; dir < 6; dir++) {
						var neighbor = Cube.neighbor(cube, dir);

						if (!cost_so_far.has(neighbor) && !isBlocked(neighbor) && Cube.$length(neighbor) <= maxMagnitude) {
							cost_so_far.set(neighbor, k + 1);
							came_from.set(neighbor, cube);
							fringes[k + 1].push(neighbor);
						}
					}
				});
			}

			return {
				cost_so_far: cost_so_far,
				came_from: came_from
			};
		},

		getPath : function(bfs) {
			var path = [];
			var cube = this.parent_controller.getDestinationPoint();

			while (cube != null) {
				path.push(cube);
				cube = bfs.came_from.get(cube);
			}

			return path;
		},

		getHex : function(x, y, z) {
			return this.parent_controller.getCollection('hexes').getHex(x, y, z);
		},

		onMouseTileOver : function(hex) {
			this.parent_controller.setDestinationPoint(hex);
		},

		onMouseTileClick : function(hex) {
			this.parent_controller.setStartingPoint(hex);
		},

		destroy : function() {

		}
	});
});