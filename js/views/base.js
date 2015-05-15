define('view/base', ['backbone'], function(Backbone) {
	return Backbone.View.extend({
		controller : null,
		initialize : function(options) {
			this.controller = options.controller;

			this.render();
		},

		_destroy : function() {
			this.destroy();
		}
	});
});