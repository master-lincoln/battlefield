define('view/battlefield', [
	'view/base',
	'gridlib/grid',
	'gridlib/cube',
	'gridlib/screen_coordinate',
	'gridlib/diagram',
	'd3',
	'jquery'
], function(
	BaseView,
	Grid,
	Cube,
	ScreenCoordinate,
	Diagram,
	d3,
	$
) {
	return BaseView.extend({
		diagram : null,

		initialize : function() {
			BaseView.prototype.initialize.apply(this, arguments);

			this.initializeUIListeners();
		},

		render : function() {
			var controller = this.controller;
			var diagram = this.diagram = this.createDiagram();

			diagram.enablePath();

			//Add distance labels
			if (controller.areDistanceLabelsEnabled()) {
				//this.addDistanceLabels(bfs);
				diagram.addCubeCoordinates();
			}

			this._draw();

			return diagram;
		},

		initializeUIListeners : function() {
			this.$el.on('mouseover', '.tile', function(e) {
				var $el = $(e.currentTarget),
					cube = this.getCubeFromSVGNode($el);

				this.controller.onMouseTileOver(cube);
			}.bind(this));

			this.$el.on('click', '.tile', function(e) {
				var $el = $(e.currentTarget),
					cube = this.getCubeFromSVGNode($el);

				this.controller.onMouseTileClick(cube);
			}.bind(this));
		},

		_draw : function() {
			var bfs = this.controller.getBFS();

			//Update CSS classes on hexes
			this.diagram.updateCssClasses(bfs);

			// Reconstruct path to mouse over position
			this.createRouteBetweenPoints(bfs);
		},

		redraw : function () {
			this._draw();
		},

		createRouteBetweenPoints : function(bfs) {
			this.diagram.setPath(this.controller.getPath(bfs));
		},

		/*addDistanceLabels : function(bfs) {
			this.diagram.tiles.selectAll("text")
				.text(function(d) {
					return bfs.cost_so_far.has(d.cube) ?
						bfs.cost_so_far.get(d.cube) :
						"";
				});
		},*/

		getCubeFromSVGNode : function($el) {
			var x = $el.attr('x') | 0,
				y = $el.attr('y') | 0,
				z = $el.attr('z') | 0;

			return this.controller.getCollection('hexes').getHex(x, y, z).getCube();
		},

		createDiagram : function() {
			//@todo move it to controller
			var diagram = new Diagram(
				this.controller,
				this.d3,
				this.controller.getScale(),
				this.controller.getCollection('hexes'),
				Grid.trapezoidalShape(0, this.controller.getHorizontalHexCount(), 0, this.controller.getVerticalHexCount(), Grid.evenRToCube)
			);

			return diagram;
		},

		animateMovement : function(path, callback) {
			this.diagram.animateMovement(path, callback);
		},

		destroy : function() {

		}
	});
});