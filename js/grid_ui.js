// Hexagonal grid functions
// From http://www.redblobgames.com/grids/hexagons.html
// Copyright 2013 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

function delay(element, action) {
	action(function(selection) {
		return selection;
	});
}

// (x, y) should be the center
// scale should be the distance from corner to corner
// orientation should be 0 (flat bottom hex) or 1 (flat side hex)
function hexToPolygon(scale, x, y, orientation) {
	// NOTE: the article says to use angles 0..300 or 30..330 (e.g. I
	// add 30 degrees for pointy top) but I instead use -30..270
	// (e.g. I subtract 30 degrees for pointy top) because it better
	// matches the animations I needed for my diagrams. They're
	// equivalent.
	var points = [];
	for (var i = 0; i < 6; i++) {
		var angle = 2 * Math.PI * (2*i - orientation) / 12;
		points.push(new ScreenCoordinate(x + 0.5 * scale * Math.cos(angle),
			y + 0.5 * scale * Math.sin(angle)));
	}
	return points;
}

// The shape of a hexagon is adjusted by the scale; the rotation is handled elsewhere, using svg transforms
function makeHexagonShape(scale) {
	return hexToPolygon(scale, 0, 0, false).map(function(p) { return p.x.toFixed(3) + "," + p.y.toFixed(3); }).join(" ");
}


/* A grid diagram will be an object with
 1. nodes = { cube: Cube object, key: string, node: d3 selection of <g> containing polygon }
 2. grid = Grid object
 3. root = d3 selection of root <g> of diagram
 4. polygons = d3 selection of the hexagons inside the <g> per tile
 5. update = function(scale, orientation) to call any time orientation changes, including initialization
 6. onLayout = callback function that will be called before an update (to assign new cube coordinates)
 - this will be called immediately on update
 7. onUpdate = callback function that will be called after an update
 - this will be called after a delay, and only if there hasn't been another update
 - since it may not be called, this function should only affect the visuals and not data
 */
function makeGridDiagram(svg, cubes) {
	var diagram = {};

	diagram.nodes = cubes.map(function(n) { return {cube: n, key: n.toString()}; });
	diagram.root = svg.append('g');
	diagram.tiles = diagram.root.selectAll("g.tile").data(diagram.nodes, function(node) { return node.key; });
	diagram.tiles.enter()
		.append('g').attr('class', "tile")
		.each(function(d) { d.node = d3.select(this); });
	diagram.polygons = diagram.tiles.append('polygon');


	diagram.makeTilesSelectable = function(callback) {
		diagram.selected = d3.set();
		diagram.toggle = function(cube) {
			if (diagram.selected.has(cube)) {
				diagram.selected.remove(cube);
			} else {
				diagram.selected.add(cube);
			}
		};

		var drag_state = 0;
		var drag = d3.behavior.drag()
			.on('dragstart', function(d) {
				drag_state = diagram.selected.has(d.cube);
			})
			.on('drag', function() {
				var target = d3.select(d3.event.sourceEvent.target);
				if (target !== undefined && target.data()[0] && target.data()[0].cube) {
					var cube = target.data()[0].cube;
					if (drag_state) {
						diagram.selected.remove(cube);
					} else {
						diagram.selected.add(cube);
					}
				}
				callback();
			});

		diagram.tiles
			.on('click', function(d) {
				d3.event.preventDefault();
				diagram.toggle(d.cube);
				callback();
			})
			.call(drag);
	};


	diagram.addLabels = function(labelFunction) {
		diagram.tiles.append('text')
			.attr('y', "0.4em")
			.text(function(d, i) { return labelFunction? labelFunction(d, i) : ""; });
		return diagram;
	};


	diagram.addHexCoordinates = function(converter, withMouseover) {
		diagram.nodes.forEach(function (n) { n.hex = converter(n.cube); });
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
				.classed('q-axis-same', function(other) { return hex.q == other.hex.q; })
				.classed('r-axis-same', function(other) { return hex.r == other.hex.r; });
		}

		if (withMouseover) {
			diagram.tiles
				.on('mouseover', function(d) { setSelection(d.hex); })
				.on('touchstart', function(d) { setSelection(d.hex); });
		}

		return diagram;
	};


	diagram.addCubeCoordinates = function(withMouseover) {
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

		if (withMouseover) {
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
	diagram.onLayout = function(callback) { pre_callbacks.push(callback); };
	diagram.onUpdate = function(callback) { post_callbacks.push(callback); };

	var hexagon_points = makeHexagonShape(diagram.scale);

	diagram.update = function(scale, orientation) {
		if (scale != diagram.scale) {
			diagram.scale = scale;
			hexagon_points = makeHexagonShape(scale);
			diagram.polygons.attr('points', hexagon_points);
		}
		diagram.orientation = orientation;

		pre_callbacks.forEach(function (f) { f(); });
		var grid = new Grid(scale, orientation, diagram.nodes.map(function(node) { return node.cube; }));
		var bounds = grid.bounds();
		var first_draw = !diagram.grid;
		diagram.grid = grid;

		delay(svg, function(animate) {
			if (first_draw) {
				animate = function(selection) { return selection; };
			}

			// NOTE: In Webkit I can use svg.node().clientWidth but in Gecko that returns 0 :(
			diagram.translate = new ScreenCoordinate((parseFloat(svg.attr('width')) - bounds.minX - bounds.maxX)/2,
				(parseFloat(svg.attr('height')) - bounds.minY - bounds.maxY)/2);
			animate(diagram.root)
				.attr('transform', "translate(" + diagram.translate + ")");

			animate(diagram.tiles)
				.attr('transform', function(node) {
					var center = grid.hexToCenter(node.cube);
					return "translate(" + center.x + "," + center.y + ")";
				});

			animate(diagram.polygons)
				.attr('transform', "rotate(" + (orientation * -30) + ")");

			post_callbacks.forEach(function (f) { f(); });
		});

		return diagram;
	};

	return diagram;
}

function breadthFirstSearch(start, maxMovement, maxMagnitude, blocked) {
	/* see http://www.redblobgames.com/pathfinding/a-star/introduction.html */
	var cost_so_far = d3.map(); cost_so_far.set(start, 0);
	var came_from = d3.map(); came_from.set(start, null);
	var fringes = [[start]];
	for (var k = 0; k < maxMovement && fringes[k].length > 0; k++) {
		fringes[k+1] = [];
		fringes[k].forEach(function(cube) {
			for (var dir = 0; dir < 6; dir++) {
				var neighbor = Cube.neighbor(cube, dir);
				if (!cost_so_far.has(neighbor) && !blocked(neighbor) && Cube.$length(neighbor) <= maxMagnitude) {
					cost_so_far.set(neighbor, k+1);
					came_from.set(neighbor, cube);
					fringes[k+1].push(neighbor);
				}
			}
		});
	}
	return {cost_so_far: cost_so_far, came_from: came_from};
}


function makeMovementRange() {
	var diagram = makeGridDiagram(d3.select("#diagram-movement-range"), Grid.hexagonalShape(5))
		.addLabels();

	diagram.makeTilesSelectable(redraw);
	diagram.selected = d3.set([
		new Cube(2, -1, -1),
		new Cube(2, -2, 0),
		new Cube(0, -2, 2),
		new Cube(-1, -1, 2),
		new Cube(-1, 0, 1),
		new Cube(1, 0, -1),
		new Cube(1, -3, 2),
		new Cube(1, 2, -3),
		new Cube(0, 2, -2),
		new Cube(-1, 2, -1),
		new Cube(2, -3, 1),
		new Cube(-2, 1, 1),
		new Cube(-3, 1, 2),
		new Cube(-4, 1, 3),
		new Cube(-5, 1, 4)
	]);

	var mouseover = new Cube(2, 2, -4);
	diagram.tiles
		.on('mouseover', function(d) { mouseover = d.cube; redraw(); })
		.on('touchstart', function(d) { mouseover = d.cube; redraw(); })
		.on('touchmove', function(d) { mouseover = d.cube; redraw(); });

	var distance_limit = 4;

	function redraw() {
		var bfs = breadthFirstSearch(new Cube(0, 0, 0), Infinity, 5, diagram.selected.has.bind(diagram.selected));

		distance_limit = parseInt(d3.select("#limit-movement-range").node().value);
		d3.selectAll(".movement-range").text(distance_limit);

		diagram.tiles
			.classed('blocked', function(d) { return diagram.selected.has(d.cube); })
			.classed('shadow', function(d) { return !bfs.cost_so_far.has(d.cube) || bfs.cost_so_far.get(d.cube) > distance_limit; })
			.classed('start', function(d) { return Cube.$length(d.cube) == 0; })
			.classed('goal', function(d) { return d.cube.equals(mouseover); });
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
	}

	diagram.onUpdate(redraw);
	diagram.addPath();

	d3.select("#limit-movement-range")
		.on('change', redraw)
		.on('input', redraw);

	return diagram;
}

var diagram_movement_range = makeMovementRange();

function orient(orientation) {
	diagram_movement_range.update(50, orientation);
}

orient(true);