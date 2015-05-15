// Hexagonal grid functions
// From http://www.redblobgames.com/grids/hexagons.html
// Copyright 2013 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>

console.info("I'm happy to answer questions about the code — email me at redblobgames@gmail.com");


/* There are lots of diagrams on the page and many of them get updated
 * at the same time, on a button press. Drawing them all is slow; let's
 * delay the drawing.
 *
 * The logic is:
 * 1. If a diagram is updated, put it in a queue.
 * 2. If a diagram is in the queue and is on screen,
 *    a. if it's the first time drawing it, draw it immediately
 *    b. otherwise, animate the transition from previous state
 * 3. If a diagram is in the queue and is not on screen,
 *    draw it in the background (if the user is idle)
 */

// The idle tracker will call a callback when the user is idle 1000,
// 1100, 1200, etc. milliseconds. I use this to draw off-screen
// diagrams in the background. If there are no diagrams to redraw,
// call idle_tracker.stop() to remove the interval and event handlers.
var idle_tracker = {
	interval: 1000,
	idle_threshold: 1000,
	running: false,
	needs_to_run: false,
	last_activity: Date.now(),
	callback: null
};
idle_tracker.user_activity = function(e) {
	this.last_activity = Date.now();
}
idle_tracker.loop = function() {
	idle_tracker.running = setTimeout(idle_tracker.loop, idle_tracker.interval);
	if (idle_tracker.needs_to_run || Date.now() - idle_tracker.last_activity > idle_tracker.idle_threshold) {
		idle_tracker.callback();
	}
	idle_tracker.needs_to_run = false;
}
idle_tracker.start = function() {
	this.needs_to_run = true;
	if (!this.running) {
		// There is no loop running so start it, and also start tracking user idle
		this.running = setTimeout(this.loop, 0);
		window.addEventListener('scroll', this.user_activity);
		window.addEventListener('touchmove', this.user_activity);
	} else {
		// There's a loop scheduled but I want it to run immediately
		clearTimeout(this.running);
		this.running = setTimeout(this.loop, 1);
	}
};
idle_tracker.stop = function() {
	if (this.running) {
		// Stop tracking user idle when we don't need to (performance)
		window.removeEventListener('scroll', this.user_activity);
		window.removeEventListener('touchmove', this.user_activity);
		clearTimeout(this.running);
		this.running = false;
	}
}

// How far outside the viewport is this element? 0 if it's visible even partially.
function distanceToScreen(node) {
	// Compare two ranges: the top:bottom of the browser window and
	// the top:bottom of the element
	var viewTop = window.pageYOffset;
	var viewBottom = viewTop + window.innerHeight;

	// Workaround for Firefox: SVG nodes have no
	// offsetTop/offsetHeight so I check the parent instead
	if (node.offsetTop === undefined) {
		node = node.parentNode;
	}
	var elementTop = node.offsetTop;
	var elementBottom = elementTop + node.offsetHeight;
	return Math.max(0, elementTop - viewBottom, viewTop - elementBottom);
}

// Draw all the on-screen elements that are queued up, and anything
// else if we're idle
function _delayedDraw() {
	var actions = [];
	var idle_draws_allowed = 4;

	// First evaluate all the actions and how far the elements are from being viewed
	delay.queue.forEach(function(id, ea) {
		var element = ea[0], action = ea[1];
		var d = distanceToScreen(element.node());
		actions.push([id, action, d]);
	});

	// Sort so that the ones closest to the viewport are first
	actions.sort(function(a, b) { return a[2] - b[2]; });

	// Draw all the ones that are visible now, or up to
	// idle_draws_allowed that aren't visible now
	actions.forEach(function(ia) {
		var id = ia[0], action = ia[1], d = ia[2];
		if (d == 0 || idle_draws_allowed > 0) {
			if (d != 0) --idle_draws_allowed;

			delay.queue.remove(id);
			delay.refresh.add(id);

			var animate = delay.refresh.has(id) && d == 0;
			action(function(selection) {
				return animate? selection.transition().duration(200) : selection;
			});
		}
	});
}

// Function for use with d3.timer
function _delayDrawOnTimeout() {
	_delayedDraw();
	if (delay.queue.keys().length == 0) { idle_tracker.stop(); }
}

// Interface used by the rest of the code: call this function with the
// d3 selection of the element being drawn (typically an <svg>) and an
// action. The action will be called with an animate parameter, which
// is a function that takes a d3 selection and returns it optionally
// with an animated transition.
function delay(element, action) {
	delay.queue.set(element.attr('id'), [element, action]);
	idle_tracker.start();
}
delay.queue = d3.map();  // which elements need redrawing?
delay.refresh = d3.set();  // set of elements we've seen before
idle_tracker.callback = _delayDrawOnTimeout;
window.addEventListener('scroll', _delayedDraw);
window.addEventListener('resize', _delayedDraw);

/* NOTE: on iOS, scroll event doesn't occur until after the scrolling
 * stops, which is too late for this redraw. I am not sure how to do
 * this properly. Instead of drawing only on scroll, I also draw in
 * the background when the user is idle. */




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


// Arrow drawing utility takes a <path>, source, dest, and sets the d= and transform
function makeArrow(path, w, skip, A, B, withBase) {
	var d = A.subtract(B);
	var h = d.length()-2*w-skip;

	var path_d = ['M', 0, 0];
	if (h > 0.0) {
		path_d = path_d.concat([
			'l', 2*w, 2*w,
			'l', 0, -w,
			'l', h, 0,
			'l', -0.3*w, -w,
			'l', 0.3*w, -w,
			'l', -h, 0,
			'l', 0, -w,
			'Z']);
		if (withBase) {
			path_d = path_d.concat([
				'M', h+w, -10*w,
				'l', 0, 20*w
			]);
		}
	}

	path
		.attr('transform', "translate(" + B + ") rotate(" + (180 / Math.PI * Math.atan2(d.y, d.x)) + ")")
		.attr('d', path_d.join(" "));
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
			if (first_draw) { animate = function(selection) { return selection; }; }

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

// Diagram "spacing"

function format_quarters(a) {
	// Format a/4 as a mixed numeral
	var suffix = ["", "¼", "½", "¾"][a % 4];
	var prefix = Math.floor(a/4);
	if (prefix == 0 && suffix != "") { prefix = ""; }
	return prefix + suffix;
}

function makeNeighbors(id_diagram, id_code, converter, parity_var) {
	// Note that this code is a little messy because I'm trying to handle cube, axial, offset
	var code = d3.select(id_code).selectAll("span.table span");
	var code_parity = d3.select(id_code).selectAll("span.parity");
	var numSpans = code[0].length;  // should be 6 (axial) or 12 (offset)

	// There will be either 7 (axial) or 14 nodes (offset)
	var cubes = [];
	for (var i = 0; i < (numSpans * 7 / 6); i++) {
		if (converter == null) {
			cubes.push(i < 6? Cube.direction(i) : new Cube(0, 0, 0));
		} else {
			cubes.push(new Cube(i, -i, 0));  // dummy coordinates for now
		}
	}

	var diagram = makeGridDiagram(d3.select(id_diagram), cubes);
	diagram.parity_var = parity_var;
	diagram.converter = converter;
	diagram.nodes.forEach(function (d, i) {
		d.direction = (i < numSpans)? (i % 6) : null;
		d.key = i;
	});

	if (converter) {
		diagram.addLabels();
	} else {
		diagram.addCubeCoordinates(false);
	}

	function neighbor(odd, i) {
		var base = odd? new Cube(1, -2, 1) : new Cube(0, 0, 0);
		var h1 = diagram.converter(base);
		var h2 = diagram.converter(Cube.neighbor(base, i));
		var dq = h2.q - h1.q, dr = h2.r - h1.r;
		return new Hex(dq, dr);
	}

	if (diagram.converter) {
		diagram.onUpdate(function() {
			diagram.tiles.selectAll("text").text(function(d) {
				if (d.key < numSpans) {
					var h = neighbor(d.key >= 6, d.direction);
					return [h.q > 0? "+" : "", h.q == 0? "0" : h.q, ", ",
						h.r > 0? "+" : "", h.r == 0? "0" : h.r].join("");
				} else if (numSpans == 12) {
					return ((d.key == 12)? "EVEN" : "ODD") + " " + diagram.parity_var;
				} else {
					return "axial";
				}
			});
			code_parity.text(diagram.parity_var);
			code.text(function(_, i) {
				var h = neighbor(i >= 6, i % 6);
				function fmt(x) { if (x > 0) x = "+" + x; else x = "" + x; if (x.length < 2) x = " " + x; return x; }
				return ["Hex(", fmt(h.q), ", ", fmt(h.r), ")"].join("");
			});
		});
	}


	diagram.onLayout(function() {
		var offcenter = diagram.orientation? new Cube(4, -4, 0) : new Cube(4, -2, -2);

		diagram.nodes.forEach(function (d, i) {
			if (i < 6) {
				d.cube = Cube.direction(i);
			} else if (i < 12 && numSpans == 12) {
				d.cube = Cube.neighbor(offcenter, i % 6);
			} else if (i == 13) {
				d.cube = offcenter;
			} else {
				d.cube = new Cube(0, 0, 0);
			}
		});
	});

	function setSelection(d) {
		code.classed('highlight', function(_, i) { return i < numSpans && i == d.key; });
		diagram.tiles.classed('highlight', function(_, i) { return i < numSpans && i == d.key; });
	}

	diagram.tiles
		.on('mouseover', setSelection)
		.on('touchstart', setSelection);

	return diagram;
}

// Helper function used for hex regions. A hex shaped region is the
// subset of hexes where a <= x <= b, c <= y <= d, e <= z <= f
function colorRegion(diagram, xmin, xmax, ymin, ymax, zmin, zmax, label) {
	// Here's the range algorithm as described in the article
	var results = d3.set();
	for (var x = xmin; x <= xmax; x++) {
		for (var y = Math.max(ymin, -x-zmax); y <= Math.min(ymax, -x-zmin); y++) {
			var z = -x-y;
			results.add(new Cube(x, y, z));
		}
	}

	diagram.tiles.classed(label, function(d) { return results.has(d.cube); });
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


function makePathfinding() {
	var radius = 6;
	var diagram = makeGridDiagram(d3.select("#diagram-pathfinding"), Grid.hexagonalShape(radius));

	diagram.makeTilesSelectable(redraw);
	diagram.selected = d3.set([
		new Cube(2, -1, -1),
		new Cube(2, -2, 0),
		new Cube(1, -2, 1),
		new Cube(0, -2, 2),
		new Cube(-1, -1, 2),
		new Cube(0, 2, -2),
		new Cube(1, 2, -1),
		new Cube(1, -3, 0),
		new Cube(-2, 0, 2),
		new Cube(-3, 0, 3)
	]);

	var start = new Cube(-2, 4, -2);
	var goal = new Cube(1, -4, 3);
	diagram.tiles
		.on('mouseover', function(d) { goal = d.cube; redraw(); })
		.on('touchstart', function(d) { goal = d.cube; redraw(); })
		.on('touchmove', function(d) { goal = d.cube; redraw(); });

	function redraw() {
		var bfs = breadthFirstSearch(start, 1000, radius, diagram.selected.has.bind(diagram.selected));
		var path = [];
		for (var p = goal; p != null; p = bfs.came_from.get(p)) {
			path.push(p);
		}

		diagram.setPath(path);
		path = d3.set(path);
		diagram.tiles
			.classed('blocked', function(d) { return diagram.selected.has(d.cube); })
			.classed('start', function(d) { return d.cube.equals(start); })
			.classed('goal', function(d) { return d.cube.equals(goal); })
			.classed('path', function(d) { return path.has(d.cube); });
	}

	diagram.onUpdate(redraw);
	diagram.addPath();
	return diagram;
}

var grid_cube = makeGridDiagram(d3.select("#grid-cube"), Grid.hexagonalShape(3))
	.addCubeCoordinates(true);

var grid_axial = makeGridDiagram(d3.select("#grid-axial"), Grid.hexagonalShape(3))
	.addHexCoordinates(Grid.cubeToTwoAxis, true);

var neighbors_diagonal = makeGridDiagram(d3.select("#neighbors-diagonal"),
	Grid.hexagonalShape(1).concat(
		[new Cube(2, -1, -1), new Cube(-2, 1, 1),
			new Cube(-1, 2, -1), new Cube(1, -2, 1),
			new Cube(-1, -1, 2), new Cube(1, 1, -2)]))
	.addCubeCoordinates(false);
neighbors_diagonal.tiles.classed('highlight', function(d) { return Cube.$length(d.cube) == 2; });

var diagram_movement_range = makeMovementRange();

function orient(orientation) {
	diagram_movement_range.update(50, orientation);
}

orient(true);