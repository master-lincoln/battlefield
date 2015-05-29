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

			this.initializeUIListeners();
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

		render : function() {
			this._draw();

			return this.diagram;
		},

		_draw : function() {
			var bfs = this.controller.getBFS();

			//Update CSS classes on hexes
			this.controller.updateCssClasses(bfs);

			// Reconstruct path to mouse over position
			this.createRouteBetweenPoints(bfs);
		},

		redraw : function () {
			this._draw();
		},

		createRouteBetweenPoints : function(bfs) {
			this.controller.setPath(this.controller.getPath(bfs));
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

		destroy : function() {

		}
	});
});