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

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.initializeLayer('grid');
			this.initializeLayer('grid_hover');
			this.initializeLayer('grid_obstacles');

			this.grid = new Grid(this.controller.getScale(), this.controller.getOrientation(), this.controller.getMapShape());

			this.initializeUIListeners();
			this.createGroundCells();
			this.drawObstacles();
			//this.loadUnits();
		},

		initializeLayer : function(layer_name) {
			var $layer = this.controller.getLayer(layer_name);
			$layer.attr({width : this.WIDTH, height : this.HEIGHT});
			this['$layer_' + layer_name] = $layer[0].getContext('2d');
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
				hexes = this.controller.getHexes();

			for (var i = 0; i < hexes.length; i++) {
				var hex = hexes[i];

				if (hex.getPolygon().containsPoint(point)) {
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

				this.$layer_grid.font = "8px serif";
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

		updateCssClasses : function() {
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
		},

		createRouteBetweenPoints : function() {
			this.controller.createRouteBetweenPoints();
		},

		/*addDistanceLabels : function(bfs) {
		 this.diagram.tiles.selectAll("text")
		 .text(function(d) {
		 return bfs.cost_so_far.has(d.cube) ?
		 bfs.cost_so_far.get(d.cube) :
		 "";
		 });
		 },*/

		getHexFromSVGNode : function($el) {
			var x = $el.attr('x') | 0,
				y = $el.attr('y') | 0,
				z = $el.attr('z') | 0;

			return this.controller.getHex(x, y, z);
		},

		loadUnits : function() {
			var units = this.controller.getUnits();

			for(var i = 0; i < units.length; i++) {
				var position = units[i].getPosition();
				var hex = this.controller.getHex(position);
				var cube = hex.getCube();


				this.createUnit(i);
			}
		},

		createUnit : function(i) {
			var foreign = Snap.parse(
				'<svg>'
					+ '<foreignObject id="f_unit" width="100" height="100" x="200" y="200" transform="translate(0,0)">'
						+ '<body><div class="battlefield_unit hobgoblin"></div></body>'
					+'</foreignObject>'
				+ '</svg>');

			var animation = Snap.parse('<animateMotion repeatCount="1" dur="1.7999999999999998s" fill="freeze" begin="indefinite" path="M 88.33459118601273,76.5 L 66.25094338950956,114.75 L 44.167295593006365,153 L 66.25094338950954,191.25 L 88.33459118601274,229.5 L 110.41823898251592,267.75"></animateMotion>');

			var g = this.$layer_grid.g().attr({
				width : 100,
				height:100
			}).append(foreign).append(animation);

			g.select('animateMotion').node.beginElement();
//console.log("g.select('animateMotion')", g.select('animateMotion').node)
			return foreign;
		},

		animate : function(unit, callback) {
			var from = unit.getPreviousPosition(),
				to = unit.getPosition();
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