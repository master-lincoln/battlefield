define('model/obstacle', [
	'backbone',
	'gridlib/cube'
], function(
	Backbone,
	Cube
) {
	return Backbone.Model.extend({
		defaults : {
			x : null,
			y : null,
			z : null
		},

		getCube : function() {
			return new Cube(this.get('x'), this.get('y'), this.get('z'))
		}
	})
});
