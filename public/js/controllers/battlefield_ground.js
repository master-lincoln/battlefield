define('controller/battlefield_ground', [
	'controller/base',
	'controller/battlefield/unit_movement_animation',
	'view/battlefield_ground',
	'gridlib/screen_coordinate',
	'gridlib/grid',
	'gridlib/cube'
], function(
	BaseController,
	UnitMovementAnimationController,
	BattlefieldGroundView,
	ScreenCoordinate,
	Grid,
	Cube
) {
	return BaseController.extend({

		initialize : function(options) {
			BaseController.prototype.initialize.apply(this, arguments);

			this.$d3 = d3.select(this.el);
			this.$root = this.$d3.append('g');

			this.initializeView();
			this.initializeAnimationController();
			this.initializeEvents();
		},

		initializeEvents : function() {
			var battlefield_units = this.getCollection('battlefield_units'),
				battlefield = this.getModel('battlefield');

			battlefield_units.onUnitMovement(this, function(unit) {
				this.view.animate(unit, function() {
					this.view.rerender();
				}.bind(this));
			}.bind(this));

			battlefield.onCursorPositionChange(this, function(model) {
				this.view.rerender();
			}.bind(this));

			battlefield.onActiveUnitChange(this, function(model) {
				this.view.rerender();
			}.bind(this));
		},

		initializeView : function() {
			this.view = new BattlefieldGroundView({
				el : this.$el,
				$d3 : this.$d3,
				$root : this.$root,
				controller : this
			});

			if (this.isMovementRouteEnabled()) {
				this.view.enablePath();
			}

			//Add distance labels
			if (this.parent_controller.areHexLabelsEnabled()) {
				//this.addDistanceLabels(bfs);
				this.view.addCubeCoordinates(this.getHexes());
			}

			this.view.render();
		},

		initializeAnimationController : function() {
			this.registerController('unit_movement_animation', new UnitMovementAnimationController({
				el : this.$el,
				$d3 : this.$d3,
				$root : this.$root,
				parent_controller : this
			}));
		},

		/**
		 * (x, y) should be the center
		 * scale should be the distance from corner to corner
		 * orientation should be 0 (flat bottom hex) or 1 (flat side hex)
		 */
		hexToPolygon : function hexToPolygon(scale, x, y, orientation) {
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
		getHexagonShape : function getHexagonShape(scale) {
			return this.hexToPolygon(scale, 0, 0, false).map(function(screen_coordinate) {
				return screen_coordinate.x.toFixed(3) + "," + screen_coordinate.y.toFixed(3);
			}).join(" ");
		},

		isHexBlocked : function(cube) {
			var is_obstacle = this.parent_controller.getCollection('obstacles').isObstacle(cube);

			//Later we will check here whether unit is standing on this hex as well

			return is_obstacle;
		},

		getBFS : function(from) {
			return this.breadthFirstSearch(
				from,
				this.parent_controller.getUnitSpeed(),
				this.parent_controller.getMaxDistance(),
				this.isHexBlocked.bind(this)
			);
		},

		/**
		 * @see http://www.redblobgames.com/pathfinding/a-star/introduction.html
		 *
		 * @param starting_point
		 * @param max_movement
		 * @param max_magnitude
		 * @param isBlocked
		 * @returns {{cost_so_far: (Array|*), came_from: (Array|*)}}
		 */
		breadthFirstSearch : function(starting_point, max_movement, max_magnitude, isBlocked) {
			var cost_so_far = d3.map();
			var came_from = d3.map();
			var fringes = [[starting_point]];

			cost_so_far.set(starting_point, 0);
			came_from.set(starting_point, null);

			for (var k = 0; k < max_movement && fringes[k].length > 0; k++) {
				fringes[k + 1] = [];
				fringes[k].forEach(function(cube) {
					for (var dir = 0; dir < 6; dir++) {
						var neighbor = Cube.neighbor(cube, dir);

						if (!cost_so_far.has(neighbor) && !isBlocked(neighbor) && Cube.$length(neighbor) <= max_magnitude) {
							cost_so_far.set(neighbor, k + 1);
							came_from.set(neighbor, cube);
							fringes[k + 1].push(neighbor);
						}
					}
				});
			}

			return {
				cost_so_far: cost_so_far,
				came_from: came_from
			};
		},

		getPath : function(from, to) {
			var path = [],
				bfs = this.getBFS(from);

			while (to != null) {
				path.push(to);
				to = bfs.came_from.get(to);
			}

			return path;
		},

		getHex : function(x, y, z) {
			return this.getCollection('hexes').getHex(x, y, z);
		},

		getHexes : function() {
			return this.getCollection('hexes').getHexes();
		},

		addHexes : function(hexes) {
			return this.getCollection('hexes').addHexes(hexes, true);
		},

		isMovementRouteEnabled : function() {
			return this.parent_controller.isMovementRouteEnabled();
		},

		getScale : function() {
			return this.parent_controller.getScale();
		},

		getMapShape : function() {
			return this.parent_controller.getMapShape();
		},

		getHexStatuses : function(bfs, hex) {
			var unit_speed = this.parent_controller.getUnitSpeed(),
				starting_point = this.parent_controller.getStartingPoint(),
				destination_point = this.parent_controller.getDestinationPoint(),
				cube = hex.getCube();

			return {
				blocked : this.isHexBlocked(cube),
				shadow : !bfs.cost_so_far.has(cube) || bfs.cost_so_far.get(cube) > unit_speed,
				start : this.hasUnitStanding(hex),
				goal : destination_point ? cube.equals(destination_point) : false,
				selected : cube.x === starting_point.x && cube.y === starting_point.y && cube.z === starting_point.z
			};
		},

		hasUnitStanding : function(hex) {
			return this.getCollection('battlefield_units').isUnit(hex);
		},

		createRouteBetweenPoints : function() {
			var from = this.parent_controller.getStartingPoint(),
				to = this.parent_controller.getDestinationPoint();

			this.view.setPath(this.getPath(from, to));
		},

		onMouseTileOver : function(hex) {
			this.parent_controller.setDestinationPoint(hex);
		},

		onMouseTileClick : function(hex) {
			if (this.hasUnitStanding(hex)) {
				this.parent_controller.setStartingPoint(hex);
			}
			else {
				this.parent_controller.moveActiveUnitTo(hex);
			}
		},

		destroy : function() {

		}
	});
});