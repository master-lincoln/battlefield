define('controller/battlefield', [
	'controller/base',
	'd3',
	'view/battlefield',
	'gridlib/cube',
	'provider/events',
	'controller/battlefield_ground'
], function(
	BaseController,
	d3,
	BattlefieldView,
	Cube,
	eventsProvider,
	BattlefieldGroundController
) {
	return BaseController.extend({
		SCALE : 80,
		HEX_LABELS_ENABLED : true,
		MOVEMENT_ROUTE_ENABLED : true,

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

			this.initializeView();
			this.initializeBattlefieldGround();
		},

		initializeView : function() {
			this.view = new BattlefieldView({
				el : this.$el,
				controller : this
			});

			this.view.render();
		},

		initializeBattlefieldGround : function() {
			this.battlefield_ground = new BattlefieldGroundController({
				parent_controller : this,
				el : this.$el,
				shape : this.map.shape
			});
		},

		getScale : function() {
			return this.SCALE;
		},

		getMaxDistance : function() {
			return Infinity;
		},

		getUnitSpeed : function() {
			return this.active_unit.getSpeed();
		},

		areHexLabelsEnabled : function() {
			return this.HEX_LABELS_ENABLED;
		},

		isMovementRouteEnabled : function() {
			return this.MOVEMENT_ROUTE_ENABLED;
		},

		getDestinationPoint : function() {
			return this.destination_point;
		},

		getStartingPoint : function() {
			return this.active_unit.getPosition();
		},

		setStartingPoint : function(hex) {
			this.active_unit.moveTo(hex.getCube());
		},

		setDestinationPoint : function(hex) {
			this.destination_point = hex.getCube();
			this.battlefield_ground.view.rerender();
		},

		destroy : function() {

		}
	});
});