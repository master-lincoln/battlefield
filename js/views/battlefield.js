define('view/battlefield', [
	'view/base',
	'gridlib/grid',
	'gridlib/cube',
	'd3'
], function(
	BaseView,
	Grid,
	Cube,
	d3
) {
	return BaseView.extend({
		diagram : null,

		initialize : function() {
			BaseView.prototype.initialize.apply(this, arguments);
		},

		render : function() {
			var controller = this.controller;
			var diagram = this.diagram = this.createDiagram();

			this.diagram.addLabels();

			var redraw = function () {
				var bfs = controller.breadthFirstSearch(new Cube(0, 0, 0), Infinity, controller.getMaxDistance(), diagram.selected.has.bind(diagram.selected));

				var distance_limit = this.getDistanceLimit();

				d3.selectAll(".movement-range").text(distance_limit);

				diagram.tiles
					.classed('blocked', function(d) {
						return diagram.selected.has(d.cube);
					})
					.classed('shadow', function(d) {
						return !bfs.cost_so_far.has(d.cube) || bfs.cost_so_far.get(d.cube) > distance_limit;
					})
					.classed('start', function(d) {
						return Cube.$length(d.cube) == 0;
					})
					.classed('goal', function(d) {
						return d.cube.equals(mouseover);
					});

				diagram.tiles.selectAll("text")
					.text(function(d) { return bfs.cost_so_far.has(d.cube)? bfs.cost_so_far.get(d.cube) : ""; });

				// Reconstruct path to mouseover position
				var path = [];
				var node = mouseover;
				while (node != null) {
					path.push(node);
					node = bfs.came_from.get(node);
				}
				diagram.setPath(path);
			}.bind(this);

			if (controller.areObstaclesManuallyEditable()) {
				diagram.makeTilesSelectable(redraw);
			}

			diagram.selected = this.controller.getObstacles();

			var onEventOccur = function(d) {
				mouseover = d.cube;
				redraw();
			};

			//Starting end point
			var mouseover = new Cube(0, -4, 4);
			diagram.tiles
				.on('mouseover', onEventOccur)
				.on('touchstart', onEventOccur)
				.on('touchmove', onEventOccur);

			diagram.onUpdate(redraw);
			diagram.addPath();

			d3.select("#limit-movement-range")
				.on('change', redraw)
				.on('input', redraw);

			return diagram;
		},

		getDistanceLimit : function() {
			return parseInt(d3.select("#limit-movement-range").node().value, 10);
		},

		createDiagram : function() {
			return this.controller.makeGridDiagram(
				this.d3,
				Grid.trapezoidalShape(0, this.controller.getHorizontalHexCount(), 0, this.controller.getVerticalHexCount(),	Grid.evenRToCube)
			);
		},

		destroy : function() {

		}
	});
});