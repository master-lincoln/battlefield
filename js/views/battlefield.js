define('view/battlefield', [
	'view/base',
	'gridlib/grid',
	'gridlib/cube',
	'gridlib/screen_coordinate',
	'd3',
	'jquery'
], function(
	BaseView,
	Grid,
	Cube,
	ScreenCoordinate,
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

			diagram.selected = this.controller.getObstacles();
			diagram.addPath();

			//Add distance labels
			if (controller.areDistanceLabelsEnabled()) {
				//this.addDistanceLabels(bfs);
				diagram.addCubeCoordinates();
			}

			return diagram;
		},

		redraw : function () {
			var bfs = this.getBFS();

			//Update CSS classes on hexes
			this.updateCssClasses(bfs);

			// Reconstruct path to mouse over position
			this.createRouteBetweenPoints(bfs);
		},

		getBFS : function() {
			var controller = this.controller;

			return controller.breadthFirstSearch(
				controller.getStartingPoint(),
				controller.getMaxMovement(),
				controller.getMaxDistance(),
				this.diagram.selected.has.bind(this.diagram.selected)
			);
		},

		createRouteBetweenPoints : function(bfs) {
			var path = [];
			var cube = this.controller.getDestinationPoint();

			while (cube != null) {
				path.push(cube);
				cube = bfs.came_from.get(cube);
			}

			this.diagram.setPath(path);
		},

		addDistanceLabels : function(bfs) {
			this.diagram.tiles.selectAll("text")
				.text(function(d) {
					return bfs.cost_so_far.has(d.cube) ?
						bfs.cost_so_far.get(d.cube) :
						"";
				});
		},

		updateCssClasses : function(bfs) {
			var nodes = this.diagram.nodes,
				diagram = this.diagram,
				distance_limit = this.controller.getDistanceLimit(),
				starting_point = this.controller.getStartingPoint(),
				destination_point = this.controller.getDestinationPoint();

			for (var i = 0, l = nodes.length; i < l; i++) {
				var node = nodes[i],
					cube = node.cube;

				node.tile.classed({
					'blocked' : diagram.selected.has(cube),
					'shadow' : !bfs.cost_so_far.has(cube) || bfs.cost_so_far.get(cube) > distance_limit,
					'start' : cube.x === starting_point.x && cube.y === starting_point.y && cube.z === starting_point.z,
					'goal' : cube.equals(destination_point)
				});
			}
		},

		getCubeFromSVGNode : function($el) {
			var x = $el.attr('x') | 0,
				y = $el.attr('y') | 0,
				z = $el.attr('z') | 0;

			return this.getNode(x, y, z).cube;
		},

		getNode : function(x, y, z) {
			var nodes = this.diagram.nodes;

			for(var i = 0, l = nodes.length; i < l; i++) {
				var cube = nodes[i].cube;

				if (cube.x === x && cube.y === y && cube.z === z) {
					return nodes[i];
				}
			}

			return null;
		},

		initializeUIListeners : function() {
			this.$el.on('mouseover', '.tile', function(e) {
				var $el = $(e.currentTarget),
					cube = this.getCubeFromSVGNode($el);

				this.controller.setDestinationPoint(cube);
				var bfs = this.getBFS();
				this.createRouteBetweenPoints(bfs);
				this.updateCssClasses(bfs);
			}.bind(this));

			this.$el.on('click', '.tile', function(e) {
				var $el = $(e.currentTarget),
					cube = this.getCubeFromSVGNode($el);

				this.controller.setStartingPoint(cube);
				this.redraw();
			}.bind(this));
		},

		createDiagram : function() {
			return this.createGridDiagram(
				this.d3,
				Grid.trapezoidalShape(0, this.controller.getHorizontalHexCount(), 0, this.controller.getVerticalHexCount(), Grid.evenRToCube)
			);
		},

		/**
		 * A grid diagram will be an object with
		 * 1. nodes = { cube: Cube object, key: string, node: d3 selection of <g> containing polygon }
		 * 2. grid = Grid object
		 * 3. root = d3 selection of root <g> of diagram
		 * 4. polygons = d3 selection of the hexagons inside the <g> per tile
		 * 5. update = function(scale, orientation) to call any time orientation changes, including initialization
		 * 6. onLayout = callback function that will be called before an update (to assign new cube coordinates)
		 * - this will be called immediately on update
		 * 7. onUpdate = callback function that will be called after an update
		 * - this will be called after a delay, and only if there hasn't been another update
		 * - since it may not be called, this function should only affect the visuals and not data
		 *
		 * @param svg
		 * @param cubes
		 * @returns {{}}
		 */
		createGridDiagram : function(svg, cubes) {
			var diagram = {};
			var controller = this.controller;
			var hexagon_points = controller.makeHexagonShape(this.controller.getScale());

			var nodes = diagram.nodes = cubes.map(function(cube) {
				return {cube : cube};
			});

			diagram.root = svg.append('g');

			for(var i = 0, l = nodes.length; i < l; i++) {
				var cube = nodes[i].cube;
				var tile = diagram.root.append('g').attr('class', "tile").attr('x', cube.x).attr('y', cube.y).attr('z', cube.z);
				var polygon = tile.append('polygon').attr('points', hexagon_points);
				var text = tile.append('text').attr('y', "0.4em");

				nodes[i].tile = tile;
				nodes[i].polygon = polygon;
				nodes[i].text = text;
			}

			diagram.addPath = function() {
				diagram.pathLayer = this.root.append('path')
					.attr('d', "M 0 0")
					.attr('class', "path");
				diagram.setPath = function(path) {
					var d = [];
					for (var i = 0; i < path.length; i++) {
						d.push(i == 0? 'M' : 'L');
						d.push(diagram.grid.hexToCenter(path[i]));
					}
					diagram.pathLayer.attr('d', d.join(" "));
				};
			};

			diagram.addCubeCoordinates = function(with_mouseover) {
				for(var i = 0, l = nodes.length; i < l; i++) {
					var node = nodes[i];
					var labels = [node.cube.x, node.cube.y, node.cube.z];

					if (labels[0] == 0 && labels[1] == 0 && labels[2] == 0) {
						// Special case: label the origin with x/y/z so that you can tell where things to
						labels = ["x", "y", "z"];
					}

					node.text.append('tspan').attr('class', "q").text(labels[0] + ', ');
					node.text.append('tspan').attr('class', "s").text(labels[1] + ', ');
					node.text.append('tspan').attr('class', "r").text(labels[2]);
				}

				//Code to live update cubes
				/*function relocate() {
					var BL = 4;  // adjust to vertically center
					var offsets = diagram.orientation? [14, -9+BL, -14, -9+BL, 0, 13+BL] : [13, 0+BL, -9, -14+BL, -9, 14+BL];
					offsets = offsets.map(function(f) { return f * diagram.scale / 50; });
					diagram.tiles.select(".q").attr('x', offsets[0]).attr('y', offsets[1]);
					diagram.tiles.select(".s").attr('x', offsets[2]).attr('y', offsets[3]);
					diagram.tiles.select(".r").attr('x', offsets[4]).attr('y', offsets[5]);
				}
				diagram.onUpdate(relocate);*/

				return diagram;
			};

			/*diagram.addHexCoordinates = function(converter, with_mouseover) {
				diagram.nodes.forEach(function (n) {
					n.hex = converter(n.cube);
				});

				diagram.tiles.append('text')
					.attr('y', "0.4em")
					.each(function(d) {
						var selection = d3.select(this);
						selection.append('tspan').attr('class', "q").text(d.hex.q);
						selection.append('tspan').text(", ");
						selection.append('tspan').attr('class', "r").text(d.hex.r);
					});

				function setSelection(hex) {
					diagram.tiles
						.classed('q-axis-same', function(other) {
							return hex.q == other.hex.q;
						})
						.classed('r-axis-same', function(other) {
							return hex.r == other.hex.r;
						});
				}

				if (with_mouseover) {
					diagram.tiles
						.on('mouseover', function(d) {
							setSelection(d.hex);
						})
						.on('touchstart', function(d) {
							setSelection(d.hex);
						});
				}

				return diagram;
			};*/

			diagram.update = function(scale, orientation) {
				diagram.orientation = orientation;

				var grid = new Grid(scale, orientation, nodes.map(function(node) {
					return node.cube;
				}));

				var bounds = grid.bounds();
				diagram.grid = grid;

				// NOTE: In Webkit I can use svg.node().clientWidth but in Gecko that returns 0 :(
				diagram.translate = new ScreenCoordinate((parseFloat(svg.attr('width')) - bounds.minX - bounds.maxX)/2,
					(parseFloat(svg.attr('height')) - bounds.minY - bounds.maxY)/2);

				diagram.root
					.attr('transform', "translate(" + diagram.translate + ")");

				for(var i = 0, l = nodes.length; i < l; i++) {
					var node = nodes[i];
					var center = grid.hexToCenter(node.cube);

					node.tile.attr('transform', "translate(" + center.x + "," + center.y + ")");
					node.polygon.attr('transform', "rotate(" + (orientation * -30) + ")");
				}

				return diagram;
			}.bind(this);

			return diagram;
		},

		destroy : function() {

		}
	});
});