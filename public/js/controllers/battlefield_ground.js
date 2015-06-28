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
		grid : null,

		initialize : function(options) {
			BaseController.prototype.initialize.apply(this, arguments);

			var scale = this.parent_controller.getScale();
			var orientation = this.parent_controller.getOrientation();
			var map_shape = this.getMapShape();

			this.grid = new Grid(scale, orientation, map_shape);

			this.initializeView();
			this.initializeEventListeners();
		},

		initializeEventListeners : function() {
			this.getModel('battlefield').onActiveUnitChange(this, function() {
				this.invalidateBFS();
			}.bind(this));

			this.getCollection('battlefield_units').onUnitMovement(this, function() {
				this.invalidateBFS();
			});
		},

		initializeView : function() {
			this.view = new BattlefieldGroundView({
				el : this.$el,
				controller : this
			});

			//Add distance labels
			if (this.parent_controller.areHexLabelsEnabled()) {
				this.view.addCubeCoordinates(this.getHexes());
			}

			this.view.render();
		},

		getGrid : function() {
			return this.grid;
		},

		getMapShape : function() {
			return this.parent_controller.getMapShape();
		},

		getObstacles : function() {
			return this.getCollection('obstacles').getObstacles();
		},

		getHexByScreenCoordinate : function(point) {
			return this.getCollection('hexes').getHexByScreenCoordinate(point);
		},

		isObstacle : function(cube) {
			return this.getCollection('obstacles').isObstacle(cube);
		},

		/**
		 *
		 * @param {Cube|Hex} cube
		 * @returns {Boolean}
		 */
		isHexImpassable : function(arg_cube) {
			var cube = arg_cube;

			if (!(arg_cube instanceof Cube)) {
				cube = arg_cube.getCube();
			}

			var is_obstacle = this.isObstacle(cube);
			//var is_unit = 1;

			//Later we will check here whether unit is standing on this hex as well

			return is_obstacle /*|| has_unit_standing*/;
		},

		/**
		 *
		 * @param {Cube|Hex}arg_cube
		 * @returns {boolean}
		 */
		isHexInactive : function(arg_cube) {
			var cube = arg_cube;

			if (!(arg_cube instanceof Cube)) {
				cube = arg_cube.getCube();
			}

			var from = this.parent_controller.getActiveUnitCube();
			var bfs = this.getBFS(from);
			var unit_speed = this.parent_controller.getActiveUnitSpeed();

			return !bfs.cost_so_far.has(cube) || bfs.cost_so_far.get(cube) > unit_speed;
		},

		isHexActive : function(arg_cube) {
			return !this.isHexInactive(arg_cube);
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

		getUnits : function() {
			return this.getCollection('battlefield_units').getUnits();
		},

		hasUnitStanding : function(hex) {
			return this.getCollection('battlefield_units').isUnit(hex);
		},

		calculateBFS : function(from) {
			return this.grid.breadthFirstSearch(
				from,
				this.parent_controller.getActiveUnitSpeed(),
				this.parent_controller.getMaxDistance(),
				this.isHexImpassable.bind(this)
			);
		},

		invalidateBFS : function() {
			this.cached_bfs = null;
		},

		cached_bfs : null,//@todo maybe later move it to some cache service

		getBFS : function(from) {
			if (this.cached_bfs) {
				return this.cached_bfs;
			}

			return (this.cached_bfs = this.calculateBFS(from));
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

		handleMouseClick : function(hex) {
			var to = hex.getCube();
			var from = this.parent_controller.getActiveUnitCube();
			var path = this.getPath(from, to);
			var active_unit = this.parent_controller.getActiveUnit();

			this.view.moveUnitOnPolyline(active_unit, path, function() {
				this.parent_controller.moveActiveUnitTo(hex);
				this.view.drawCurrentUnitRange();
			}.bind(this));
		},

		handleMouseOver : function(hex) {
			var is_impassable = false;
			var is_inactive = false;

			//Grid does not fill entire battlefield, so there might be space where hexes don't exist
			if (hex) {
				is_impassable = this.isHexImpassable(hex);
				is_inactive = this.isHexInactive(hex);

				if (!is_impassable && !is_inactive) {
					this.view.canvasGridHover.cleanUp();
					this.view.canvasGridHover.drawHoverPolygon(hex.getCube());
				}

				// Reconstruct path to mouse over position
				if (this.isMovementRouteEnabled()) {
					var to = hex.getCube();
					var from = this.parent_controller.getActiveUnitCube();
					var path = this.getPath(from, to);

					this.view.createRouteBetweenPoints(path);
				}
			}

			this.view.updateCursor(this.getCursorCssClass(hex, is_impassable, is_inactive));
		},

		getCursorCssClass : function(hex, is_impassable, is_inactive) {
			if (!hex || is_impassable || is_inactive) {
				return 'cursor_not_allowed';
			} else {
				return 'cursor_move';
			}
		},

		destroy : function() {

		}
	});
});