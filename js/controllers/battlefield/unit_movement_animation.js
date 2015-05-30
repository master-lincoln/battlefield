define('controller/battlefield/unit_movement_animation', [
	'controller/base',
	'view/battlefield/unit_movement_animation'
], function(
	BaseController,
	UnitMovementAnimationView
) {
	return BaseController.extend({
		initialize : function(options) {
			BaseController.prototype.initialize.apply(this, arguments);
		},

		initializeView : function() {
			this.view = new UnitMovementAnimationView({
				el : this.$el,
				controller : this
			});
		},

		animate : function(unit, callback) {
			var from = unit.getPreviousPosition(),
				to = unit.getPosition();

			//getPath


			if (typeof callback === 'function') {
				callback();
			}
		},

		destroy : function() {

		}
	});
});