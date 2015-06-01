define('view/battlefield', [
	'view/base'
], function(
	BaseView
) {
	return BaseView.extend({
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.initializeEventListeners();
		},

		initializeEventListeners : function() {
			this.$el.on('click', '.battlefield_button', function() {
				alert("Sorry not implemented yet :)");
			});
		},

		destroy : function() {

		}
	});
});