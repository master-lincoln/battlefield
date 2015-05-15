define('view/battlefield', [
	'view/base',
	'gridlib/grid',
	'gridlib/cube',
	'gridlib/screen_coordinate',
	'd3'
], function(
	BaseView,
	Grid,
	Cube,
	ScreenCoordinate,
	d3
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
			var redraw = this.redraw.bind(this);

			this.diagram.addLabels();

			if (controller.areObstaclesManuallyEditable()) {
				diagram.makeTilesSelectable(redraw);
			}

			diagram.selected = this.controller.getObstacles();

			//Starting end point
			diagram.tiles.on('mouseover', function(d) {
				controller.setDestinationPoint(d.cube);

				var bfs = this.getBFS();
				this.createRouteBetweenPoints(bfs);
				this.updateGoalElementClasses();
			}.bind(this));

			diagram.onUpdate(redraw);
			diagram.addPath();

			/*d3.select("#limit-movement-range")
				.on('change', redraw)
				.on('input', redraw);*/

			return diagram;
		},

		redraw : function () {
			var controller = this.controller;

			console.log("ok")
			var bfs = this.getBFS();

			//var distance_limit = this.controller.getDistanceLimit();
			//d3.selectAll(".movement-range").text(distance_limit);

			//Update CSS classes on hexes
			this.updateCssClasses(bfs);

			//Add distance labels
			if (controller.areDistanceLabelsEnabled()) {
				this.addDistanceLabels(bfs);
			}

			// Reconstruct path to mouse over position
			this.createRouteBetweenPoints(bfs);
		},

		getBFS : function() {
			return this.controller.breadthFirstSearch(
				new Cube(0, 0, 0),
				Infinity,
				this.controller.getMaxDistance(),
				this.diagram.selected.has.bind(this.diagram.selected)
			);
		},

		createRouteBetweenPoints : function(bfs) {
			var path = [];
			var node = this.controller.getDestinationPoint();

			while (node != null) {
				path.push(node);
				node = bfs.came_from.get(node);
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
			this.updateBlockedElementsClasses();
			this.updateShadowedElementsClasses(bfs);
			this.updateStartElementClass();
			this.updateGoalElementClasses();
		},

		updateBlockedElementsClasses : function() {
			var diagram = this.diagram;

			diagram.tiles.classed('blocked', function(d) {
				return diagram.selected.has(d.cube);
			});
		},

		updateShadowedElementsClasses : function(bfs) {
			var diagram = this.diagram,
				distance_limit = this.controller.getDistanceLimit();

			diagram.tiles.classed('shadow', function(d) {
				return !bfs.cost_so_far.has(d.cube) || bfs.cost_so_far.get(d.cube) > distance_limit;
			});
		},

		updateStartElementClass : function() {
			this.diagram.tiles.classed('start', function(d) {
				return Cube.$length(d.cube) === 0;
			});
		},

		updateGoalElementClasses : function() {
			var destination_point = this.controller.getDestinationPoint();

			this.diagram.tiles.classed('goal', function(d) {
				return d.cube.equals(destination_point);
			});
		},


		initializeUIListeners : function() {

		},

		createDiagram : function() {
			return this.createGridDiagram(
				this.d3,
				Grid.trapezoidalShape(0, this.controller.getHorizontalHexCount(), 0, this.controller.getVerticalHexCount(),	Grid.evenRToCube)
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

			diagram.nodes = cubes.map(function(n) {
				return {cube: n, key: n.toString()};
			});

			diagram.root = svg.append('g');
			diagram.tiles = diagram.root.selectAll("g.tile").data(diagram.nodes, function(node) {
				return node.key;
			});

			diagram.tiles.enter()
				.append('g').attr('class', "tile")
				.each(function(d) {
					d.node = d3.select(this);
				});

			diagram.polygons = diagram.tiles.append('polygon');

			diagram.makeTilesSelectable = function(callback) {
				//Create empty 'set' of selected hexes
				diagram.selected = d3.set();

				/**
				 * Creates obstacle on the map or removes it
				 *
				 * @param cube
				 */
				diagram.toggleObstacle = function(cube) {
					if (diagram.selected.has(cube)) {
						diagram.selected.remove(cube);
					} else {
						diagram.selected.add(cube);
					}
				};

				diagram.tiles.on('click', function(d) {
					d3.event.preventDefault();
					diagram.toggleObstacle(d.cube);

					callback();
				});
			};

			diagram.addLabels = function(labelFunction) {
				diagram.tiles.append('text')
					.attr('y', "0.4em")
					.text(function(d, i) { return labelFunction? labelFunction(d, i) : ""; });
				return diagram;
			};

			diagram.addHexCoordinates = function(converter, with_mouseover) {
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
			};

			diagram.addCubeCoordinates = function(with_mouseover) {
				diagram.tiles.append('text')
					.each(function(d) {
						var selection = d3.select(this);
						var labels = [d.cube.x, d.cube.y, d.cube.z];
						if (labels[0] == 0 && labels[1] == 0 && labels[2] == 0) {
							// Special case: label the origin with x/y/z so that you can tell where things to
							labels = ["x", "y", "z"];
						}
						selection.append('tspan').attr('class', "q").text(labels[0]);
						selection.append('tspan').attr('class', "s").text(labels[1]);
						selection.append('tspan').attr('class', "r").text(labels[2]);
					});

				function relocate() {
					var BL = 4;  // adjust to vertically center
					var offsets = diagram.orientation? [14, -9+BL, -14, -9+BL, 0, 13+BL] : [13, 0+BL, -9, -14+BL, -9, 14+BL];
					offsets = offsets.map(function(f) { return f * diagram.scale / 50; });
					diagram.tiles.select(".q").attr('x', offsets[0]).attr('y', offsets[1]);
					diagram.tiles.select(".s").attr('x', offsets[2]).attr('y', offsets[3]);
					diagram.tiles.select(".r").attr('x', offsets[4]).attr('y', offsets[5]);
				}

				function setSelection(cube) {
					["q", "s", "r"].forEach(function (axis, i) {
						diagram.tiles.classed(axis + "-axis-same", function(other) { return cube.v()[i] == other.cube.v()[i]; });
					});
				}

				if (with_mouseover) {
					diagram.tiles
						.on('mouseover', function(d) { return setSelection(d.cube); })
						.on('touchstart', function(d) { return setSelection(d.cube); });
				}

				diagram.onUpdate(relocate);

				return diagram;
			};


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

			var pre_callbacks = [];
			var post_callbacks = [];

			diagram.onLayout = function(callback) {
				pre_callbacks.push(callback);
			};

			diagram.onUpdate = function(callback) {
				post_callbacks.push(callback);
			};

			var hexagon_points = controller.makeHexagonShape(diagram.scale);

			diagram.update = function(scale, orientation) {
				if (scale != diagram.scale) {
					diagram.scale = scale;
					hexagon_points = controller.makeHexagonShape(scale);
					diagram.polygons.attr('points', hexagon_points);
				}

				diagram.orientation = orientation;

				pre_callbacks.forEach(function (f) {
					f();
				});

				var grid = new Grid(scale, orientation, diagram.nodes.map(function(node) {
					return node.cube;
				}));

				var bounds = grid.bounds();
				diagram.grid = grid;

				// NOTE: In Webkit I can use svg.node().clientWidth but in Gecko that returns 0 :(
				diagram.translate = new ScreenCoordinate((parseFloat(svg.attr('width')) - bounds.minX - bounds.maxX)/2,
					(parseFloat(svg.attr('height')) - bounds.minY - bounds.maxY)/2);

				diagram.root
					.attr('transform', "translate(" + diagram.translate + ")");

				diagram.tiles
					.attr('transform', function(node) {
						var center = grid.hexToCenter(node.cube);
						return "translate(" + center.x + "," + center.y + ")";
					});

				diagram.polygons
					.attr('transform', "rotate(" + (orientation * -30) + ")");

				post_callbacks.forEach(function (f) {
					f();
				});

				return diagram;
			}.bind(this);

			return diagram;
		},

		destroy : function() {

		}
	});
});