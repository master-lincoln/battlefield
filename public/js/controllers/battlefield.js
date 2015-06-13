define('controller/battlefield', [
	'controller/base',
	'view/battlefield',
	'gridlib/cube',
	'provider/events',
	'controller/battlefield_ground'
], function(
	BaseController,
	BattlefieldView,
	Cube,
	eventsProvider,
	BattlefieldGroundController
) {
	return BaseController.extend({
		SCALE : 51,
		HEX_LABELS_ENABLED : true,
		MOVEMENT_ROUTE_ENABLED : false,

		cm_context : {
			main : 'battlefield',
			sub : 'main'
		},

		active_unit : null,

		initialize : function(options) {
			BaseController.prototype.initialize.apply(this, arguments);

			/*this.observeEvent(eventsProvider.hex.clicked, function(e, data) {
				console.log('events', arguments);
			});*/

			this.map = options.map;
			this.setActiveUnit(this.getCollection('battlefield_units').getFirstUnit());

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
			this.registerController('battlefield_ground', new BattlefieldGroundController({
				parent_controller : this,
				el : this.$el,
				layers : {
					grid : this.$el.find('.layer-grid'),
					grid_hover : this.$el.find('.layer-grid-hover'),
					grid_obstacles : this.$el.find('.layer-grid-obstacles')
				}
			}));
		},

		setActiveUnit : function(battlefield_unit) {
			this.getModel('battlefield').setActiveUnit(battlefield_unit);
		},

		getActiveUnit : function() {
			return this.getModel('battlefield').getActiveUnit();
		},

		getMapShape : function() {
			return this.map.shape;
		},

		getScale : function() {
			return this.SCALE;
		},

		getMaxDistance : function() {
			return Infinity;
		},

		getUnitSpeed : function() {
			return this.getActiveUnit().getSpeed();
		},

		areHexLabelsEnabled : function() {
			return this.HEX_LABELS_ENABLED;
		},

		isMovementRouteEnabled : function() {
			return this.MOVEMENT_ROUTE_ENABLED;
		},

		getStartingPoint : function() {
			return this.getActiveUnit().getCube();
		},

		moveActiveUnitTo : function(hex) {
			this.getActiveUnit().moveTo(hex.getCube());
		},

		setStartingPoint : function(hex) {
			this.setActiveUnit(this.getCollection('battlefield_units').getUnit(hex));
		},

		getDestinationPoint : function() {
			return this.getModel('battlefield').getCursorPosition();
		},

		setDestinationPoint : function(hex) {
			this.getModel('battlefield').moveCursorTo(hex.getCube());
		},

		destroy : function() {

		}
	});
});