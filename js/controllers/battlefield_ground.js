define('controller/battlefield_ground', [
	'controller/base',
	'view/battlefield_ground'
], function(
	BaseController,
	BattlefieldGroundView
) {
	return BaseController.extend({
		initialize : function(options) {
			BaseController.prototype.initialize.apply(this, arguments);

			this.initializeView();
		},

		initializeView : function() {
			this.view = new BattlefieldGroundView({
				el : this.$el,
				controller : this
			});

			this.view.render();
		},

		destroy : function() {

		}
	});
});