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

			this.grid = new Grid(this.getScale(), this.getOrientation(), this.getMapShape());

			this.initializeView();
			this.initializeEvents();
		},

		initializeEvents : function() {

		},

		initializeView : function() {
			this.view = new BattlefieldGroundView({
				el : this.$el,
				controller : this,
				layers : {
					grid : this.$el.find('.layer-grid'),
					grid_hover : this.$el.find('.layer-grid-hover'),
					grid_obstacles : this.$el.find('.layer-grid-obstacles'),
					grid_route : this.$el.find('.layer-grid-route'),
					grid_range : this.$el.find('.layer-grid-range'),
					units : this.$el.find('.layer-units')
				}
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
		 * The shape of a hexagon is adjusted by the scale;
		 * the rotation is handled elsewhere, using svg transforms (not up-to-date info)
		 *
		 * @returns {Array}
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
			return this.grid.breadthFirstSearch(
				from,
				this.parent_controller.getUnitSpeed(),
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

		destroy : function() {

		}
	});
});