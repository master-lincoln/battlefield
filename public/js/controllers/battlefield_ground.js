define('controller/battlefield_ground', [
	'controller/base',
	'view/battlefield_ground',
	'gridlib/screen_coordinate',
	'gridlib/grid',
	'gridlib/cube',
	'd3'
], function(
	BaseController,
	BattlefieldGroundView,
	ScreenCoordinate,
	Grid,
	Cube,
	d3
) {
	return BaseController.extend({
		grid : null,
		initialize : function(options) {
			BaseController.prototype.initialize.apply(this, arguments);

			this.grid = new Grid(this.getScale(), this.getOrientation(), this.getMapShape());

			this.layers = options.layers;

			this.initializeView();
			this.initializeEvents();
		},

		initializeEvents : function() {

		},

		initializeView : function() {
			this.view = new BattlefieldGroundView({
				el : this.$el,
				controller : this,
				layers : this.layers
			});

			//Add distance labels
			if (this.parent_controller.areHexLabelsEnabled()) {
				this.view.addCubeCoordinates(this.getHexes());
			}

			this.view.render();
		},

		getHexPixelPosition : function(cube) {
			return this.grid.hexToCenter(cube);
		},

		/**
		 * The shape of a hexagon is adjusted by the scale; the rotation is handled elsewhere, using svg transforms
		 *
		 * @returns {string}
		 */
		getHexagonShape : function getHexagonShape() {
			return this.grid.hexToPolygon(0, 0);
		},

		getObstacles : function() {
			return this.getCollection('obstacles').getObstacles();
		},

		getHexByScreenCoordinate : function(point) {
			return this.getCollection('hexes').getHexByScreenCoordinate(point);
		},

		isHexBlocked : function(cube) {
			var is_obstacle = this.getCollection('obstacles').isObstacle(cube);

			//Later we will check here whether unit is standing on this hex as well

			return is_obstacle /*|| has_unit_standing*/;
		},

		getBFS : function(from) {
			return this.breadthFirstSearch(
				from,
				this.parent_controller.getUnitSpeed(),
				this.parent_controller.getMaxDistance(),
				this.isHexBlocked.bind(this)
			);
		},

		/**
		 * @see http://www.redblobgames.com/pathfinding/a-star/introduction.html
		 *
		 * @param starting_point
		 * @param max_movement
		 * @param max_magnitude
		 * @param isBlocked
		 * @returns {{cost_so_far: (Array|*), came_from: (Array|*)}}
		 */
		breadthFirstSearch : function(starting_point, max_movement, max_magnitude, isBlocked) {
			var cost_so_far = d3.map();
			var came_from = d3.map();
			var fringes = [[starting_point]];

			cost_so_far.set(starting_point, 0);
			came_from.set(starting_point, null);

			for (var k = 0; k < max_movement && fringes[k].length > 0; k++) {
				fringes[k + 1] = [];
				fringes[k].forEach(function(cube) {
					for (var dir = 0; dir < 6; dir++) {
						var neighbor = Cube.neighbor(cube, dir);

						if (!cost_so_far.has(neighbor) && !isBlocked(neighbor) && Cube.$length(neighbor) <= max_magnitude) {
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

		getPath : function(from, to) {
			var path = [],
				bfs = this.getBFS(from);

			while (to != null) {
				path.push(to);
				to = bfs.came_from.get(to);
			}

			return path;
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

		getOrientation : function() {
			return this.parent_controller.getOrientation();
		},

		getMapShape : function() {
			return this.parent_controller.getMapShape();
		},

		getUnits : function() {
			return this.getCollection('battlefield_units').getUnits();
		},

		hasUnitStanding : function(hex) {
			return this.getCollection('battlefield_units').isUnit(hex);
		},

		onMouseTileClick : function(hex) {
			if (this.hasUnitStanding(hex)) {
				this.parent_controller.setStartingPoint(hex);
			}
			else {
				this.parent_controller.moveActiveUnitTo(hex);
			}
		},

		destroy : function() {

		}
	});
});