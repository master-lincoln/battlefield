define('controller/battlefield_ground', [
	'controller/base',
	'view/battlefield_ground',
	'gridlib/screen_coordinate',
	'gridlib/grid'
], function(
	BaseController,
	BattlefieldGroundView,
	ScreenCoordinate,
	Grid
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
			this.initializeEvents();
		},

		initializeEvents : function() {

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

		isHexBlocked : function(cube) {
			var is_obstacle = this.getCollection('obstacles').isObstacle(cube);

			//Later we will check here whether unit is standing on this hex as well

			return is_obstacle /*|| has_unit_standing*/;
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

		getBFS : function(from) {
			return this.grid.breadthFirstSearch(
				from,
				this.parent_controller.getActiveUnitSpeed(),
				this.parent_controller.getMaxDistance(),
				this.isHexBlocked.bind(this)
			);
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
				console.log(hex);
				this.parent_controller.moveActiveUnitTo(hex);
				this.view.drawCurrentUnitRange();
			}.bind(this));
		},

		handleMouseOver : function(hex) {
			var cube = hex.getCube();

			if (!this.isHexBlocked(cube)) {
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
		},

		destroy : function() {

		}
	});
});