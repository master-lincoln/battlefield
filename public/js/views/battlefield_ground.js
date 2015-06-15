define('view/battlefield_ground', [
	'view/base',
	'enum/hex_states',
	'gridlib/cube',
	'gridlib/polygon',
	'gridlib/screen_coordinate',
	'helper/animate'
], function(
	BaseView,
	hexStatesEnum,
	Cube,
	Polygon,
	ScreenCoordinate,
	animateHelper
) {
	return BaseView.extend({
		$root : null,
		OFFSET_X : 103,
		OFFSET_Y : 132,
		WIDTH : 800,
		HEIGHT : 556,

		layers : null,

		$ctx_grid : null,
		$ctx_grid_hover : null,
		$ctx_grid_obstacles : null,
		$ctx_grid_route : null,
		$ctx_grid_range : null,
		$ctx_units : null,

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.layers = options.layers;

			this.initializeLayers();

			this.initializeUIListeners();
			this.createGroundCells();
			this.drawObstacles();
			this.drawUnits();
			this.drawCurrentUnitRange();
		},

		initializeLayers : function() {
			var layers = this.layers;

			for(var layer_name in layers) {
				if (layers.hasOwnProperty(layer_name)) {
					var $layer = layers[layer_name];

					$layer.attr({width : this.WIDTH, height : this.HEIGHT});
					this['$ctx_' + layer_name] = $layer[0].getContext('2d');
				}
			}
		},

		render : function() {
			this._draw();
		},

		rerender : function () {
			this._draw();
		},

		initializeUIListeners : function() {
			this.$el.on('mousemove', function(e) {
				this.handleMouseOver(e.offsetX, e.offsetY);
			}.bind(this));
		},

		handleMouseOver : function(x, y) {
			var point = new ScreenCoordinate(x, y),
				hex = this.controller.getHexByScreenCoordinate(point);

			//Grid does not fill entire battlefield, so there might be space where hexes don't exist
			if (hex) {
				var cube = hex.getCube();

				if (!this.controller.isHexBlocked(cube)) {
					this.cleanUpCanvas(this.$ctx_grid_hover);
					this.drawHoverPolygon(this.$ctx_grid_hover, hex.getCube());
				}

				// Reconstruct path to mouse over position
				if (this.controller.isMovementRouteEnabled()) {
					var from = this.controller.parent_controller.getStartingPoint();
					this.createRouteBetweenPoints(from, hex);
				}
			}
		},

		createGroundCells : function() {
			var plainHexes = [],
				hexagon_points = this.controller.getHexagonShape(),
				cubes = this.controller.getMapShape();

			for(var i = 0, l = cubes.length; i < l; i++) {
				var cube = cubes[i];
				var polygon = this.drawIdlePolygon(this.$ctx_grid, cube, hexagon_points);

				plainHexes.push({
					polygon : new Polygon(polygon),
					cube : cube
				});
			}

			this.controller.addHexes(plainHexes, true);
		},

		cleanUpCanvas : function(ctx) {
			ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
		},

		drawIdlePolygon : function(ctx, cube, hexagon_points) {
			return this.drawPolygon(ctx, cube, hexagon_points, {
				state : hexStatesEnum.IDLE
			});
		},

		drawHoverPolygon : function(ctx, cube, hexagon_points) {
			return this.drawPolygon(ctx, cube, hexagon_points, {
				state : hexStatesEnum.HOVER
			});
		},

		drawBlockedPolygon : function(ctx, cube, hexagon_points) {
			return this.drawPolygon(ctx, cube, hexagon_points, {
				state : hexStatesEnum.BLOCKED
			});
		},

		drawObstaclePolygon : function(ctx, cube, hexagon_points) {
			return this.drawPolygon(ctx, cube, hexagon_points, {
				state : hexStatesEnum.OBSTACLE
			});
		},

		drawPolygon : function(ctx, cube, hexagon_points, settings) {
			return this._drawPolygon(ctx, cube, hexagon_points || this.controller.getHexagonShape(), settings);
		},

		_drawPolygon : function(ctx, cube, hexagon_points, settings) {
			var position = this.controller.getHexPixelPosition(cube);
			var x = position.x + this.OFFSET_X;
			var y = position.y + this.OFFSET_Y;
			var polygon = [];

			ctx.beginPath();
			ctx.moveTo(x, y);//Move to center point of hexagon

			for (var j = 0; j < hexagon_points.length; j++) {
				var point = hexagon_points[j];

				if (j === 0) {
					ctx.moveTo(x + point.x, y + point.y);//Its necessary to remove line between center point of hexagon and first verticle
				}

				ctx.lineTo(x + point.x, y + point.y);
				polygon.push(new ScreenCoordinate(x + point.x, y + point.y));
			}

			ctx.lineTo(x + hexagon_points[0].x, y + hexagon_points[0].y);

			this.setHexStyles(ctx, settings.state);

			ctx.closePath();
			ctx.stroke();

			return polygon;
		},

		setHexStyles : function(ctx, state) {
			ctx.lineWidth = 1;

			switch(state) {
				case hexStatesEnum.IDLE:
					ctx.strokeStyle = '#678a00';
					ctx.fillStyle = 'rgba(0,0,0,0)';
					ctx.fill();
					break;
				case hexStatesEnum.HOVER:
					ctx.strokeStyle = '#fff200';
					ctx.fillStyle = 'rgba(0,0,0,0)';
					ctx.fill();
					break;
				case hexStatesEnum.BLOCKED:
					ctx.strokeStyle = '#678a00';
					ctx.fillStyle = 'rgba(0,0,0,0.3)';
					ctx.fill();
					break;
				case hexStatesEnum.OBSTACLE:
					ctx.strokeStyle = 'red';
					ctx.fillStyle = 'rgba(0,0,0,0)';
					ctx.fill();
					break;
			}
		},

		addCubeCoordinates : function(hexes) {
			this.$ctx_grid.fillStyle = "rgb(255,255,255)";

			for(var i = 0, l = hexes.length; i < l; i++) {
				var hex = hexes[i];
				var cube = hex.getCube();
				var position = this.controller.getHexPixelPosition(cube);

				this.$ctx_grid.font = "9px serif";
				this.$ctx_grid.fillText(cube.x + ',' + cube.y + ',' + cube.z, this.OFFSET_X + position.x - 10, this.OFFSET_Y + position.y + 4);
			}
		},

		_draw : function() {
			//Update CSS classes on hexes

			//this.updateCssClasses();
		},

		drawObstacles : function() {
			var obstacles = this.controller.getObstacles(),
				ctx = this.$ctx_grid_obstacles,
				hexagon_points = this.controller.getHexagonShape();

			for (var i = 0, l = obstacles.length; i < l; i++) {
				var obstacle = obstacles[i];

				if (!obstacle.isFakeBorder()) {
					var cube = obstacle.getCube();

					this.drawObstaclePolygon(ctx, cube, hexagon_points);
				}
			}
		},

		createRouteBetweenPoints : function(from, hex) {
			var to = hex.getCube();
			var path = this.controller.getPath(from, to);

			this.drawPath(path);
		},

		drawPath : function(path) {
			var ctx = this.$ctx_grid_route;
			var x = this.OFFSET_X;
			var y = this.OFFSET_Y;

			//
			if (path.length === 0) {
				return;
			}

			this.cleanUpCanvas(ctx);

			ctx.beginPath();
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
			ctx.lineWidth = 7;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";

			for(var i = 0; i < path.length; i++) {
				var position = this.controller.getHexPixelPosition(path[i]);

				if (i === 0) {
					ctx.moveTo(x + position.x, y + position.y);
				}
				else {
					ctx.lineTo(x + position.x, y + position.y);
				}
			}

			ctx.stroke();
		},

		drawCurrentUnitRange : function() {
			var hexes = this.controller.getHexes();
			var from = this.controller.parent_controller.getStartingPoint();
			var bfs = this.controller.getBFS(from);
			var unit_speed = this.controller.parent_controller.getUnitSpeed();
			var ctx = this.$ctx_grid_range;
			var hexagon_points = this.controller.getHexagonShape();

			for (var i = 0; i < hexes.length; i++) {
				var hex = hexes[i];
				var cube = hex.getCube();

				if (!bfs.cost_so_far.has(cube) || bfs.cost_so_far.get(cube) > unit_speed) {
					this.drawBlockedPolygon(ctx, cube, hexagon_points);
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

		createUnit : function(unit) {

			animateHelper.animateUnit(unit, this.$ctx_units, this.OFFSET_X, this.OFFSET_Y, this.controller.getHexPixelPosition.bind(this.controller));
		},

		destroy : function() {

		}
	});
});