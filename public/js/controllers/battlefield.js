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
		SCALE : 51, //scale should be the distance from corner to corner of the polygon
		ORIENTATION : true, //orientation should be 0 (flat bottom hex) or 1 (flat side hex)
		HEX_LABELS_ENABLED : true,
		MOVEMENT_ROUTE_ENABLED : true,

		cm_context : {
			main : 'battlefield',
			sub : 'main'
		},

		initialize : function(options) {
			BaseController.prototype.initialize.apply(this, arguments);

			/*this.observeEvent(eventsProvider.hex.clicked, function(e, data) {
				console.log('events', arguments);
			});*/

			this.map = options.map;

			this.setActiveUnit(this.getCollection('battlefield_units').getFirstUnit());

			this.initializeView();
			this.initializeBattlefieldGroundController();
			this.initializeEventListeners();
		},

		initializeEventListeners : function() {

		},

		initializeView : function() {
			this.view = new BattlefieldView({
				el : this.$el,
				controller : this
			});

			this.view.render();
		},

		initializeBattlefieldGroundController : function() {
			this.registerController('battlefield_ground', new BattlefieldGroundController({
				parent_controller : this,
				el : this.$el
			}));
		},

		/**
		 * =============================
		 *          Active Unit
		 * =============================
		 */
		getActiveUnitCube : function() {
			return this.getActiveUnit().getCube();
		},

		getActiveUnitSpeed : function() {
			return this.getActiveUnit().getSpeed();
		},

		moveActiveUnitTo : function(hex) {
			this.getActiveUnit().moveTo(hex.getCube());
		},

		setActiveUnit : function(battlefield_unit) {
			this.getModel('battlefield').setActiveUnit(battlefield_unit);
		},

		getActiveUnit : function() {
			return this.getModel('battlefield').getActiveUnit();
		},

		/**
		 * =============================
		 *          Settings
		 * =============================
		 */
		getMapShape : function() {
			return this.map.shape;
		},

		getOrientation : function() {
			return this.ORIENTATION;
		},

		getScale : function() {
			return this.SCALE;
		},

		getMaxDistance : function() {
			return Infinity;
		},

		areHexLabelsEnabled : function() {
			return this.HEX_LABELS_ENABLED;
		},

		isMovementRouteEnabled : function() {
			return this.MOVEMENT_ROUTE_ENABLED;
		},

		destroy : function() {

		}
	});
});