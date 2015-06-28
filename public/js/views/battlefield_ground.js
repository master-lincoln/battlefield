define('view/battlefield_ground', [
	'view/base',
	'gridlib/cube',
	'gridlib/polygon',
	'gridlib/screen_coordinate',
	'helper/canvas',
	'manager/animation',
	'class/animation_unit_behaviour',
	'jquery'
], function(
	BaseView,
	Cube,
	Polygon,
	ScreenCoordinate,
	CanvasHelper,
	AnimationsManager,
	UnitBehaviourAnimation,
	$
) {
	return BaseView.extend({
		animations_manager : null,
		grid : null,

		$body : null,

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.$body = $('body');

			this.initializeLayers();

			this.initializeUIListeners();
			this.createGroundCells();
			this.drawObstacles();
			this.drawUnits();
			this.drawCurrentUnitRange();
		},

		initializeLayers : function() {
			this.grid = this.controller.getGrid();

			this.canvasGrid = new CanvasHelper(this.$el.find('.layer-grid'), this.grid);
			this.canvasGridHover = new CanvasHelper(this.$el.find('.layer-grid-hover'), this.grid);
			this.canvasObstacles = new CanvasHelper(this.$el.find('.layer-grid-obstacles'), this.grid);
			this.canvasUnitRoute = new CanvasHelper(this.$el.find('.layer-grid-route'), this.grid);
			this.canvasUnitRange = new CanvasHelper(this.$el.find('.layer-grid-range'), this.grid);
			this.canvasUnits = new CanvasHelper(this.$el.find('.layer-units'), this.grid);

			this.animations_manager = new AnimationsManager(this.canvasUnits);
		},

		render : function() {

		},

		initializeUIListeners : function() {
			this.$el.on('mousemove', function(e) {
				this.handleMouseOver(e.offsetX, e.offsetY);
			}.bind(this));

			this.$el.on('click', function(e) {
				this.handleMouseClick(e.offsetX, e.offsetY);
			}.bind(this));
		},

		handleMouseOver : function(x, y) {
			var point = new ScreenCoordinate(x, y),
				hex = this.controller.getHexByScreenCoordinate(point);

			this.controller.handleMouseOver(hex);
		},

		handleMouseClick : function(x, y) {
			var point = new ScreenCoordinate(x, y),
				hex = this.controller.getHexByScreenCoordinate(point);

			//Grid does not fill entire battlefield, so there might be space where hexes don't exist
			if (hex) {
				this.controller.handleMouseClick(hex);
			}
		},

		updateCursor : function(css_class) {
			this.$body.removeClass().addClass(css_class);
		},

		createGroundCells : function() {
			var plainHexes = [],
				cubes = this.controller.getMapShape();

			for(var i = 0, l = cubes.length; i < l; i++) {
				var cube = cubes[i];
				var polygon = this.canvasGrid.drawIdlePolygon(cube);

				plainHexes.push({
					polygon : new Polygon(polygon),
					cube : cube
				});
			}

			this.controller.addHexes(plainHexes, true);
		},

		addCubeCoordinates : function(hexes) {
			this.canvasGrid.addCubeCoordinates(hexes);
		},

		drawObstacles : function() {
			var obstacles = this.controller.getObstacles();

			for (var i = 0, l = obstacles.length; i < l; i++) {
				var obstacle = obstacles[i];

				if (!obstacle.isFakeBorder()) {
					var cube = obstacle.getCube();

					this.canvasObstacles.drawObstaclePolygon(cube);
				}
			}
		},

		createRouteBetweenPoints : function(path) {
			this.canvasUnitRoute.drawPath(path);
		},

		drawCurrentUnitRange : function() {
			var hexes = this.controller.getHexes();

			this.canvasUnitRange.cleanUp();

			for (var i = 0; i < hexes.length; i++) {
				var hex = hexes[i];
				var cube = hex.getCube();

				if (this.controller.isHexInactive(cube)) {
					this.canvasUnitRange.drawBlockedPolygon(cube);
				}
			}

			//
			//isHexBlocked : function(cube)

			//blocked : this.isHexBlocked(cube),
			//inactive : !bfs.cost_so_far.has(cube) || bfs.cost_so_far.get(cube) > unit_speed,
			//start : this.hasUnitStanding(hex),
			//goal : destination_point ? cube.equals(destination_point) : false,
			//selected : cube.x === starting_point.x && cube.y === starting_point.y && cube.z === starting_point.z
		},

		/* addDistanceLabels : function(bfs) {
			this.diagram.tiles.selectAll("text").text(function(d) {
		 		return bfs.cost_so_far.has(d.cube) ? bfs.cost_so_far.get(d.cube) : "";
		 	});
		},*/

		drawUnits : function() {
			var units = this.controller.getUnits();

			for(var i = 0; i < units.length; i++) {
				this.createUnit(units[i]);
			}
		},

		unit_views : [],

		createUnit : function(unit) {
			//this.canvasUnits.animateUnit(unit);


			var unit = new UnitBehaviourAnimation(unit);
			unit.initialize(this.animations_manager);

			this.unit_views.push(unit);
			//unit.moveTo(new ScreenCoordinate(100, 200));
		},

		getUnitAnimation : function(unit) {
			var units = this.unit_views;

			for(var i = 0; i < units.length; i++) {
				if (units[i].isUnit(unit)) {
					return units[i];
				}
			}

			return null;
		},

		moveUnitOnPolyline : function(unit, path, callback) {
			var polyline_points = [];
			var unit_view = this.getUnitAnimation(unit);
			var l = path.length;

			while(l--) {
				polyline_points.push(this.grid.hexToCenter(path[l]));
			}

			unit_view.moveUnitOnPolyline(polyline_points, callback);
		},

		destroy : function() {

		}
	});
});