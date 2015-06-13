define('view/battlefield_ground', [
	'view/base',
	'enum/hex_states',
	'gridlib/grid',
	'gridlib/cube',
	'gridlib/polygon',
	'gridlib/screen_coordinate'
], function(
	BaseView,
	hexStatesEnum,
	Grid,
	Cube,
	Polygon,
	ScreenCoordinate
) {
	return BaseView.extend({
		grid : null,
		$root : null,
		OFFSET_X : 103,
		OFFSET_Y : 132,
		WIDTH : 800,
		HEIGHT : 556,

		$layer_grid : null,
		$layer_grid_hover : null,
		$layer_grid_obstacles : null,
		$layer_units : null,

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.initializeLayers();

			this.grid = new Grid(this.controller.getScale(), this.controller.getOrientation(), this.controller.getMapShape());

			this.initializeUIListeners();
			this.createGroundCells();
			this.drawObstacles();
			this.drawUnits();
		},

		initializeLayers : function() {
			var layers = this.controller.getLayers();

			for(var layer_name in layers) {
				if (layers.hasOwnProperty(layer_name)) {
					var $layer = layers[layer_name];

					$layer.attr({width : this.WIDTH, height : this.HEIGHT});
					this['$layer_' + layer_name] = $layer[0].getContext('2d');
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
			/*this.$el.on('mouseover', '.tile', function(e) {
				var $el = $(e.currentTarget),
					hex = this.getHexFromSVGNode($el);

				this.controller.onMouseTileOver(hex);
			}.bind(this));

			this.$el.on('click', '.tile', function(e) {
				var $el = $(e.currentTarget),
					hex = this.getHexFromSVGNode($el);

				this.controller.onMouseTileClick(hex);
			}.bind(this));*/

			this.$el.on('mousemove', function(e) {
				this.handleMouseOver(e.offsetX, e.offsetY);
			}.bind(this));
		},

		handleMouseOver : function(x, y) {
			var point = new ScreenCoordinate(x, y),
				hex = this.controller.getHexByScreenCoordinate(point);

			if (hex) {
				var cube = hex.getCube();

				if (!this.controller.isHexBlocked(cube)) {
					this.cleanUpCanvas(this.$layer_grid_hover);
					this.drawHoverPolygon(this.$layer_grid_hover, hex.getCube());
				}
			}
		},

		createGroundCells : function() {
			var plainHexes = [],
				scale = this.controller.getScale(),
				hexagon_points = this.controller.getHexagonShape(scale),
				cubes = this.controller.getMapShape();

			for(var i = 0, l = cubes.length; i < l; i++) {
				var cube = cubes[i];
				var polygon = this.drawIdlePolygon(this.$layer_grid, cube, hexagon_points);

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

		drawPolygon : function(ctx, cube, hexagon_points, settings) {
			var scale = this.controller.getScale();

			return this._drawPolygon(ctx, cube, hexagon_points || this.controller.getHexagonShape(scale), settings);
		},

		_drawPolygon : function(ctx, cube, hexagon_points, settings) {
			var position = this.grid.hexToCenter(cube);
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
			ctx.strokeStyle = this.getHexStrokeColor(settings.state);
			ctx.lineWidth = 1;
			ctx.fillStyle = 'rgba(0,0,0,0)';

			ctx.closePath();
			ctx.stroke();

			return polygon;
		},

		getHexStrokeColor : function(state) {
			switch(state) {
				case hexStatesEnum.IDLE:
					return '#678a00';
				case hexStatesEnum.HOVER:
					return '#fff200';
				case hexStatesEnum.BLOCKED:
					return 'red';
				default:
					return '#678a00';
			}
		},

		enablePath : function() {
			this.pathLayer = this.$layer_grid.path('M 0 0').attr('class', 'path');

			this.setPath = function(path) {
				var d = [];

				for (var i = 0; i < path.length; i++) {
					d.push(i == 0 ? 'M' : 'L');
					d.push(this.grid.hexToCenter(path[i]));
				}

				this.pathLayer.attr('d', d.join(" "));
			};
		},

		addCubeCoordinates : function(hexes) {
			this.$layer_grid.fillStyle = "rgb(255,255,255)";

			for(var i = 0, l = hexes.length; i < l; i++) {
				var hex = hexes[i];
				var cube = hex.getCube();
				var position = this.grid.hexToCenter(cube);

				this.$layer_grid.font = "9px serif";
				this.$layer_grid.fillText(cube.x + ',' + cube.y + ',' + cube.z, this.OFFSET_X + position.x - 10, this.OFFSET_Y + position.y + 4);
			}
		},

		_draw : function() {
			//Update CSS classes on hexes

			//this.updateCssClasses();

			// Reconstruct path to mouse over position
			if (this.controller.isMovementRouteEnabled()) {
				this.createRouteBetweenPoints();
			}
		},

		drawObstacles : function() {
			var obstacles = this.controller.getObstacles(),
				ctx = this.$layer_grid_obstacles,
				scale = this.controller.getScale(),
				hexagon_points = this.controller.getHexagonShape(scale);

			for (var i = 0, l = obstacles.length; i < l; i++) {
				var obstacle = obstacles[i];

				if (!obstacle.isFakeBorder()) {
					var cube = obstacle.getCube();

					this.drawBlockedPolygon(ctx, cube, hexagon_points);
				}
			}
		},

		/*updateCssClasses : function() {
			var hexes = this.controller.getHexes(),
				bfs = this.controller.getBFS(this.controller.parent_controller.getStartingPoint());

			for (var i = 0, l = hexes.length; i < l; i++) {
				var hex = hexes[i];
				var hex_status = this.controller.getHexStatuses(bfs, hex);
				var tile = hex.getTile();

				for(var class_name in hex_status) {
					if (hex_status.hasOwnProperty(class_name)) {
						tile.toggleClass(class_name, hex_status[class_name]);
					}
				}
			}
		},*/

		createRouteBetweenPoints : function() {
			this.controller.createRouteBetweenPoints();
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
			var sprite_data = unit.getSpriteData().walk,
				cube = unit.getCube(),
				position = this.grid.hexToCenter(cube);

			var img = document.createElement('img');
			img.src = sprite_data.url;

			img.onload = function() {
				var steps = sprite_data.steps,
					img_width = sprite_data.width,
					img_height = sprite_data.height;

				img.width = img_width * steps;
				img.height = img_height;

				this.$layer_units.drawImage(
					img,
					0,
					0,
					img_width,
					img_height,
					this.OFFSET_X + position.x - sprite_data.legs_x,
					this.OFFSET_Y + position.y - sprite_data.legs_y,
					img_width,
					img_height
				);
			}.bind(this);
		},

		animate : function(unit, callback) {
			var from = unit.getPreviousPosition(),
				to = unit.getCube();
			var hex = this.controller.getHex(from.x, from.y, from.z);
			var tile = hex.getTile();

			var getPath = function(path) {
				var d = [];

				for (var i = 0; i < path.length; i++) {
					d.push(i == 0 ? 'M' : 'L');
					d.push(this.grid.hexToCenter(path[i]));
				}

				return d.join(" ");
			}.bind(this);

			var path = this.controller.getPath(from, to);

			var clone = tile.clone();
			var animate = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");

			animate.setAttribute('repeatCount','1');
			animate.setAttribute('dur', (path.length * 0.3) +'s');
			animate.setAttribute('fill','freeze');
			animate.setAttribute('begin','indefinite');
			animate.setAttribute('path', getPath(path.reverse()));
			animate.addEventListener('endEvent', animationEnd, false);
			clone.attr({
				transform : 'translate(0,0)'
			});

			clone.append(animate);
			clone.appendTo(this.$layer_grid);

			animate.beginElement();
console.log("animate", animate)
			function animationEnd() {
				callback();

				clone.remove();
			}
		},

		destroy : function() {

		}
	});
});