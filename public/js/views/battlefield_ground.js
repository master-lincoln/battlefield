define('view/battlefield_ground', [
	'view/base',
	'snap',
	'gridlib/grid',
	'gridlib/cube',
	'gridlib/polygon',
	'gridlib/screen_coordinate'
], function(
	BaseView,
	Snap,
	Grid,
	Cube,
	Polygon,
	ScreenCoordinate
) {
	return BaseView.extend({
		$root : null,
		OFFSET_X : 103,
		OFFSET_Y : 132,

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			//var snap = new Snap('#diagram-movement-range');

			this.orientation = true;//This will not change so I keep it here
			//this.$root = snap.g();

			this.$root = this.el.getContext('2d');

			this.initializeUIListeners();
			this.createGroundCells();
			//this.loadUnits();
		},

		render : function() {
			//this._draw();
		},

		rerender : function () {
			//this._draw();
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
					console.log(hex.getCube());
				}
			}
		},

		createGroundCells : function() {
			var plainHexes = [],
				scale = this.controller.getScale(),
				cubes = this.controller.getMapShape(),
				hexagon_points = this.controller.getHexagonShape(scale);

			var offset_x = this.OFFSET_X;
			var offset_y = this.OFFSET_Y;

			var grid = this.grid = new Grid(scale, this.orientation, cubes);

			for(var i = 0, l = cubes.length; i < l; i++) {
				var cube = cubes[i];
				var position = grid.hexToCenter(cube);
				var x = position.x + offset_x;
				var y = position.y + offset_y;
				var polygon = [];

				this.$root.beginPath();
				this.$root.moveTo(x, y);//Move to center point of hexagon

				for (var j = 0; j < hexagon_points.length; j++) {
					var point = hexagon_points[j];

					if (j === 0) {
						this.$root.moveTo(x + point.x, y + point.y);//Its necessary to remove line between center point of hexagon and first verticle
					}

					this.$root.lineTo(x + point.x, y + point.y);
					polygon.push(new ScreenCoordinate(x + point.x, y + point.y));
				}

				plainHexes.push({
					polygon : new Polygon(polygon),
					cube : cube
				});

				this.$root.lineTo(x + hexagon_points[0].x, y + hexagon_points[0].y);
				this.$root.strokeStyle = "#678a00";
				this.$root.lineWidth = 1;
				this.$root.fillStyle = "rgba(0,0,0,0)";

				this.$root.closePath();
				this.$root.stroke();

				/*plainHexes.push({
					cube : cube,
					tile : tile,
					polygon : polygon
				});*/
			}

			this.controller.addHexes(plainHexes, true);
		},

		enablePath : function() {
			this.pathLayer = this.$root.path('M 0 0').attr('class', 'path');

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
			for(var i = 0, l = hexes.length; i < l; i++) {
				var hex = hexes[i];
				var cube = hex.getCube();
				var tile = hex.getTile();
				var labels = [cube.x, cube.y, cube.z];

				if (labels[0] == 0 && labels[1] == 0 && labels[2] == 0) {
					// Special case: label the origin with x/y/z so that you can tell where things to
					labels = ['x', 'y', 'z'];
				}

				tile.text(0, 0, labels[0] + ', ' + labels[1] + ', ' + labels[2]);
			}
		},

		_draw : function() {
			//Update CSS classes on hexes
			this.updateCssClasses();

			// Reconstruct path to mouse over position
			if (this.controller.isMovementRouteEnabled()) {
				this.createRouteBetweenPoints();
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

			var g = this.$root.g().attr({
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
			clone.appendTo(this.$root);

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