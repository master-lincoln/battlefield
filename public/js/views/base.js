define('view/base', [
	'backbone'
], function(
	Backbone
) {
	return Backbone.View.extend({
		controller : null,

		initialize : function(options) {
			this.controller = options.controller;
		},

		_destroy : function() {
			this.$el.off();

			this.destroy();
		}
	});
});