define('controller/battlefield', [
	'controller/base',
	'd3',
	'view/battlefield',
	'gridlib/screen_coordinate',
	'gridlib/grid',
	'gridlib/cube',
	'gridlib/diagram',
	'provider/events',
	'controller/battlefield_ground'
], function(
	BaseController,
	d3,
	BattlefieldView,
	ScreenCoordinate,
	Grid,
	Cube,
	Diagram,
	eventsProvider,
	BattlefieldGroundController
) {
	return BaseController.extend({
		SCALE : 80,
		SHOW_DISTANCE_LABELS : true,

		cm_context : {
			main : 'battlefield',
			sub : 'main'
		},

		starting_point : null,
		destination_point : null,
		active_unit : null,

		initialize : function(options) {
			BaseController.prototype.initialize.apply(this, arguments);

			/*this.observeEvent(eventsProvider.hex.clicked, function(e, data) {
				console.log('events', arguments);
			});*/

			this.map = options.map;
			this.active_unit = this.getCollection('battlefield_units').getFirstUnit();
			this.battlefield_ground = new BattlefieldGroundController({});

			this.initializeView();
		},

		initializeView : function() {
			this.view = new BattlefieldView({
				el : this.$el,
				controller : this,
				diagram : this.createDiagram()
			});

			this.view.render();
		},

		getScale : function() {
			return this.SCALE;
		},

		getMaxDistance : function() {
			return Infinity;
		},

		getUnitSpeed : function() {
			//return Infinity;
			return 4;
		},

		areDistanceLabelsEnabled : function() {
			return this.SHOW_DISTANCE_LABELS;
		},

		getDestinationPoint : function() {
			return this.destination_point || new Cube(0, -4, 4);
		},

		getStartingPoint : function() {
			return this.active_unit.getPosition();
		},

		setStartingPoint : function(cube) {
			this.active_unit.moveTo(cube);
			this.view.redraw();
		},

		setDestinationPoint : function(cube) {
			this.destination_point = cube;
			this.view.redraw();
		},

		getDistanceLimit : function() {
			return 4;
		},

		isHexBlocked : function(cube) {
			var is_obstacle = this.getCollection('obstacles').isObstacle(cube);

			//Later we will check here whether unit is standing on this hex as well

			return is_obstacle;
		},

		getBFS : function() {
			return this.breadthFirstSearch(
				this.getStartingPoint(),
				this.getUnitSpeed(),
				this.getMaxDistance(),
				this.isHexBlocked.bind(this)
			);
		},

		/**
		 * @see http://www.redblobgames.com/pathfinding/a-star/introduction.html
		 *
		 * @param start
		 * @param maxMovement
		 * @param maxMagnitude
		 * @param isBlocked
		 * @returns {{cost_so_far: (Array|*), came_from: (Array|*)}}
		 */
		breadthFirstSearch : function(start, maxMovement, maxMagnitude, isBlocked) {
			var cost_so_far = d3.map();
			var came_from = d3.map();
			var fringes = [[start]];

			cost_so_far.set(start, 0);
			came_from.set(start, null);

			for (var k = 0; k < maxMovement && fringes[k].length > 0; k++) {
				fringes[k + 1] = [];
				fringes[k].forEach(function(cube) {
					for (var dir = 0; dir < 6; dir++) {
						var neighbor = Cube.neighbor(cube, dir);

						if (!cost_so_far.has(neighbor) && !isBlocked(neighbor) && Cube.$length(neighbor) <= maxMagnitude) {
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

		getPath : function(bfs) {
			var path = [];
			var cube = this.getDestinationPoint();

			while (cube != null) {
				path.push(cube);
				cube = bfs.came_from.get(cube);
			}

			return path;
		},

		createDiagram : function() {
			var diagram = new Diagram(
				this,
				d3.select(this.el),
				this.getScale(),
				this.getCollection('hexes'),
				this.map.shape
			);

			return diagram;
		},

		onMouseTileOver : function(cube) {
			this.setDestinationPoint(cube);
		},

		onMouseTileClick : function(cube) {
			this.setStartingPoint(cube);
		},

		destroy : function() {

		}
	});
});