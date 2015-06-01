define('view/battlefield_ground', [
	'view/base',
	'gridlib/grid',
	'gridlib/cube',
	'gridlib/screen_coordinate'
], function(
	BaseView,
	Grid,
	Cube,
	ScreenCoordinate
) {
	return BaseView.extend({
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.orientation = true;//This will not change so I keep it here
			this.$d3 = options.$d3;
			this.$root = options.$root;

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

			for(var i = 0, l = cubes.length; i < l; i++) {
				var cube = cubes[i];
				var tile = this.$root.append('g')
					.attr('class', "tile")
					.attr('x', cube.x)
					.attr('y', cube.y)
					.attr('z', cube.z)
					.attr('enable-background', 'new');
				var polygon = tile.append('polygon').attr('points', hexagon_points);
				var label = tile.append('text').attr('y', "0.4em");

				plainHexes.push({
					cube : cube,
					tile : tile,
					polygon : polygon,
					label : label
				});
			}

			var hexes = this.controller.addHexes(plainHexes, true);

			var grid = this.grid = new Grid(scale, this.orientation, hexes.map(function(hex) {
				return hex.getCube();
			}));

			var bounds = grid.bounds();

			// NOTE: In Webkit I can use svg.node().clientWidth but in Gecko that returns 0 :(
			/*var translate = new ScreenCoordinate(
				(parseFloat(this.$d3.attr('width')) - bounds.minX - bounds.maxX) / 2,
				(parseFloat(this.$d3.attr('height')) - bounds.minY - bounds.maxY) / 2
			);*/

			this.$root.attr('transform', "translate(103,122)");

			for(var i = 0, l = hexes.length; i < l; i++) {
				var hex = hexes[i];
				var center = grid.hexToCenter(hex.getCube());

				hex.getTile().attr('transform', "translate(" + center.x + "," + center.y + ")");
				hex.getPolygon().attr('transform', "rotate(" + (this.orientation * -30) + ")");
			}
		},

		loadUnits : function() {
			var units = this.controller.getUnits();

			for(var i = 0; i < units.length; i++) {
				var position = units[i].getPosition();
				var hex = this.controller.getHex(position);

				hex.getTile().append('rect')
					.attr('class', 'battlefield_unit ' + units[i].getType())
					.attr('transform', 'translate(-50, -50)')
					.attr('width', 100)
					.attr('height', 100);

				console.log(position, hex);
			}


		},

		enablePath : function() {
			this.pathLayer = this.$root.append('path')
				.attr('d', "M 0 0")
				.attr('class', "path");

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
				var label = hex.getLabel();
				var labels = [cube.x, cube.y, cube.z];

				if (labels[0] == 0 && labels[1] == 0 && labels[2] == 0) {
					// Special case: label the origin with x/y/z so that you can tell where things to
					labels = ['x', 'y', 'z'];
				}

				label.append('tspan').attr('class', "q").text(labels[0] + ', ');
				label.append('tspan').attr('class', "s").text(labels[1] + ', ');
				label.append('tspan').attr('class', "r").text(labels[2]);
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

				hex.getTile().classed(this.controller.getHexStatuses(bfs, hex));
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

		animate : function(unit, callback) {
			var from = unit.getPreviousPosition(),
				to = unit.getPosition();
			var hex = this.controller.getHex(from.x, from.y, from.z);

			var tile = hex.getTile();
			//console.log(tile);

			//var clone = d3.select(tile[0][0].cloneNode(true));


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

			/*svgChild.firstChild.setAttribute('from','100');
			 svgChild.firstChild.setAttribute('to','200');
			 svgChild.firstChild.beginElement()*/


			function animationEnd() {
				callback();

				clone.parentNode.removeChild(clone);
			}
		},

		destroy : function() {

		}
	});
});