define('view/battlefield', [
	'view/base'
], function(
	BaseView
) {
	return BaseView.extend({
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
		},

		destroy : function() {

		}
	});
});