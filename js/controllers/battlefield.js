define('controller/battlefield', [
	'controller/base',
	'd3',
	'view/battlefield',
	'gridlib/screen_coordinate',
	'gridlib/grid',
	'gridlib/cube',
	'provider/events'
], function(
	BaseController,
	d3,
	BattlefiledView,
	ScreenCoordinate,
	Grid,
	Cube,
	eventsProvider
) {
	return BaseController.extend({
		SCALE : 80,
		MAX_DISTANCE : 20,
		HOR_HEX_COUNT : 15,
		VER_HEX_COUNT : 11,
		EDITABLE_OBSTACLES : true,
		SHOW_DISTANCE_LABELS : true,

		cm_context : {
			main : 'battlefield',
			sub : 'main'
		},

		starting_point : null,
		destination_point : null,

		initialize : function() {
			BaseController.prototype.initialize.apply(this, arguments);

			/*this.observeEvent(eventsProvider.hex.clicked, function(e, data) {
				console.log('events', arguments);
			});*/

			this.initializeView();
		},

		initializeView : function() {
			this.view = new BattlefiledView({
				el : this.$el,
				controller : this
			});

			/*this.publishEvent(eventsProvider.hex.clicked, {
				lol : 1
			});*/


			var orientation = true;
			var diagram_movement_range = this.view.render();
			diagram_movement_range.update(this.getScale(), orientation);
		},

		getScale : function() {
			return this.SCALE;
		},

		getMaxDistance : function() {
			//return this.MAX_DISTANCE;
			return Infinity;
		},

		getMaxMovement : function() {
			//return Infinity;
			return 4;
		},

		getHorizontalHexCount : function() {
			return this.HOR_HEX_COUNT - 1;
		},

		getVerticalHexCount : function() {
			return this.VER_HEX_COUNT - 1;
		},

		areObstaclesManuallyEditable : function() {
			return this.EDITABLE_OBSTACLES;
		},

		areDistanceLabelsEnabled : function() {
			return this.SHOW_DISTANCE_LABELS;
		},

		getDestinationPoint : function() {
			return this.destination_point || new Cube(0, -4, 4);
		},

		getStartingPoint : function() {
			return this.starting_point || new Cube(3, -4, 1);
		},

		setStartingPoint : function(cube) {
			this.starting_point = cube;

			this.view.redraw();
		},

		setDestinationPoint : function(cube) {
			this.destination_point = cube;
		},

		getDistanceLimit : function() {
			return 4;
		},

		/**
		 * (x, y) should be the center
		 * scale should be the distance from corner to corner
		 * orientation should be 0 (flat bottom hex) or 1 (flat side hex)
		 */
		hexToPolygon : function(scale, x, y, orientation) {
			// NOTE: the article says to use angles 0..300 or 30..330 (e.g. I
			// add 30 degrees for pointy top) but I instead use -30..270
			// (e.g. I subtract 30 degrees for pointy top) because it better
			// matches the animations I needed for my diagrams. They're
			// equivalent.
			var points = [];

			for (var i = 0; i < 6; i++) {
				var angle = 2 * Math.PI * (2 * i - orientation) / 12;

				points.push(new ScreenCoordinate(
					x + 0.5 * scale * Math.cos(angle),
					y + 0.5 * scale * Math.sin(angle)
				));
			}

			return points;
		},

		/**
		 * The shape of a hexagon is adjusted by the scale; the rotation is handled elsewhere, using svg transforms
		 *
		 * @param scale
		 * @returns {string}
		 */
		makeHexagonShape : function(scale) {
			return this.hexToPolygon(scale, 0, 0, false).map(function(p) {
				return p.x.toFixed(3) + "," + p.y.toFixed(3);
			}).join(" ");
		},

		/**
		 * @see http://www.redblobgames.com/pathfinding/a-star/introduction.html
		 *
		 * @param start
		 * @param maxMovement
		 * @param maxMagnitude
		 * @param blocked
		 * @returns {{cost_so_far: (Array|*), came_from: (Array|*)}}
		 */
		breadthFirstSearch : function(start, maxMovement, maxMagnitude, blocked) {
			var cost_so_far = d3.map();
			var came_from = d3.map();
			var fringes = [[start]];

			cost_so_far.set(start, 0);
			came_from.set(start, null);

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

			return {
				cost_so_far: cost_so_far,
				came_from: came_from
			};
		},

		getObstacles : function() {
			var top_border = [],
				bottom_border = [];
			var hor_count = this.getHorizontalHexCount() + 2,
				ver_count = this.getVerticalHexCount();

			for(var i = 0, l = hor_count; i < l; i++) {
				top_border.push(new Cube(i, 1 - i, -1));
				bottom_border.push(new Cube(i - 6, - 5 - i, ver_count + 1));
			}

			var left_border = [
				new Cube(-1, 1, 0),
				new Cube(-2, 1, 1),
				new Cube(-2, 0, 2),
				new Cube(-3, 0, 3),
				new Cube(-3, -1, 4),
				new Cube(-4, -1, 5),
				new Cube(-4, -2, 6),
				new Cube(-5, -2, 7),
				new Cube(-5, -3, 8),
				new Cube(-6, -3, 9),
				new Cube(-6, -4, 10)
			];

			var right_border = [
				new Cube(15, -15, 0),
				new Cube(14, -15, 1),
				new Cube(14, -16, 2),
				new Cube(13, -16, 3),
				new Cube(13, -17, 4),
				new Cube(12, -17, 5),
				new Cube(12, -18, 6),
				new Cube(11, -18, 7),
				new Cube(11, -19, 8),
				new Cube(10, -19, 9),
				new Cube(10, -20, 10)
			];

			var obstacles = [
				new Cube(2, -4, 2),
				new Cube(1, -4, 3),
				new Cube(0, -2, 2)
			];

			//Blocking the start
			return d3.set(obstacles.concat(top_border, left_border, right_border, bottom_border));
		}
	});
});