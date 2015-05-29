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

			this.cubes = options.shape;

			this.initializeView();
			this.initializeEvents();
		},

		initializeEvents : function() {
			var battlefield_units = this.getCollection('battlefield_units');

			battlefield_units.onUnitMovement(this, function(model) {
				this.view.rerender();
			}.bind(this));
		},

		initializeView : function() {
			this.view = new BattlefieldGroundView({
				el : this.$el,
				controller : this
			});

			if (this.isMovementRouteEnabled()) {
				this.view.enablePath();
			}

			//Add distance labels
			if (this.parent_controller.areHexLabelsEnabled()) {
				//this.addDistanceLabels(bfs);
				this.view.addCubeCoordinates(this.getHexes());
			}

			this.view.render();
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
		getHexagonShape : function getHexagonShape(scale) {
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
			return this.getCollection('hexes').getHex(x, y, z);
		},

		getHexes : function() {
			return this.getCollection('hexes').getHexes();
		},

		addHexes : function(hexes) {
			return this.getCollection('hexes').addHexes(hexes, true);
		},

		isMovementRouteEnabled : function() {
			return this.parent_controller.isMovementRouteEnabled();
		},

		getScale : function() {
			return this.parent_controller.getScale();
		},

		getHexStatuses : function(bfs, hex) {
			var unit_speed = this.parent_controller.getUnitSpeed(),
				starting_point = this.parent_controller.getStartingPoint(),
				destination_point = this.parent_controller.getDestinationPoint(),
				cube = hex.getCube();

			return {
				blocked : this.isHexBlocked(cube),
				shadow : !bfs.cost_so_far.has(cube) || bfs.cost_so_far.get(cube) > unit_speed,
				start : cube.x === starting_point.x && cube.y === starting_point.y && cube.z === starting_point.z,
				goal : destination_point ? cube.equals(destination_point) : false
			};
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