define('view/battlefield/unit_movement_animation', [
	'view/base'
], function(
	BaseView
) {
	return BaseView.extend({
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			console.log("ok");
		},

		destroy : function() {

		}
	});
});