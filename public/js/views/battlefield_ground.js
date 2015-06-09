define('view/battlefield_ground', [
	'view/base',
	'snap',
	'gridlib/grid',
	'gridlib/cube',
	'gridlib/screen_coordinate'
], function(
	BaseView,
	Snap,
	Grid,
	Cube,
	ScreenCoordinate
) {
	return BaseView.extend({
		$root : null,

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			var snap = new Snap('#diagram-movement-range');

			this.orientation = true;//This will not change so I keep it here
			this.$root = snap.g();

			this.initializeUIListeners();
			this.createGroundCells();
			this.loadUnits();
		},

		render : function() {
			this._draw();
		},

		rerender : function () {
			this._draw();
		},

		initializeUIListeners : function() {
			this.$el.on('mouseover', '.tile', function(e) {
				var $el = $(e.currentTarget),
					hex = this.getHexFromSVGNode($el);

				this.controller.onMouseTileOver(hex);
			}.bind(this));

			this.$el.on('click', '.tile', function(e) {
				var $el = $(e.currentTarget),
					hex = this.getHexFromSVGNode($el);

				this.controller.onMouseTileClick(hex);
			}.bind(this));
		},

		createGroundCells : function() {
			var plainHexes = [],
				scale = this.controller.getScale(),
				cubes = this.controller.getMapShape(),
				hexagon_points = this.controller.getHexagonShape(scale);

			var grid = this.grid = new Grid(scale, this.orientation, cubes);

			for(var i = 0, l = cubes.length; i < l; i++) {
				var cube = cubes[i];
				var position = grid.hexToCenter(cube);
				var label;
				var labels = [cube.x, cube.y, cube.z];

				var tile = this.$root.g()
					.attr({
						'class' : 'tile',
						x : cube.x,
						y : cube.y,
						z : cube.z,
						transform : 'translate(' + position.x + ',' + position.y + ')'
					});

				var polygon = tile.polygon().attr({
					points : hexagon_points,
					transform : 'rotate(' + (this.orientation * -30) + ')'
				});

				plainHexes.push({
					cube : cube,
					tile : tile,
					polygon : polygon
				});
			}

			this.controller.addHexes(plainHexes, true);

			this.$root.transform('translate(103,122)');
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
			/*var units = this.controller.getUnits();

			for(var i = 0; i < units.length; i++) {
				var position = units[i].getPosition();
				var hex = this.controller.getHex(position);
				var cube = hex.getCube();


				this.createUnit(i);
			}*/
		},

		createUnit : function(i) {
			var foregin = this.$d3.append('foreignObject')
				.attr('id', 'unit_'+i)
				.attr('width', 100)
				.attr('height', 100)
				.attr('x', 200)
				.attr('y', 200)
				.attr('transform', "translate(0,0)");

			foregin.append("xhtml:div")
				.attr('class', 'battlefield_unit hobgoblin');

			return foregin;
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

			var clone = tile[0][0].cloneNode(true);
			//var clone = tile.clone();

			var animate = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");

			animate.setAttribute('repeatCount','1');
			animate.setAttribute('dur', (path.length * 0.3) +'s');
			animate.setAttribute('fill','freeze');
			animate.setAttribute('begin','indefinite');
			animate.setAttribute('path', getPath(path.reverse()));
			animate.addEventListener('endEvent', animationEnd, false);

			clone.setAttribute('transform', "translate(0,0)");
			clone.appendChild(animate);
			this.$root[0][0].appendChild(clone);

			animate.beginElement();

			function animationEnd() {
				callback();

				clone.parentNode.removeChild(clone);
			}
		},

		destroy : function() {

		}
	});
});