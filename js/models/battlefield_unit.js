define('model/battlefield_unit', [
	'backbone',
	'gridlib/cube'
], function(
	Backbone,
	Cube
) {
	return Backbone.Model.extend({
		defaults : {
			position : {x : 0, y : 0, z : 0}
		},

		getPosition : function() {
			var position = this.get('position');
			return new Cube(position.x, position.y, position.z);
		},

		moveTo : function(cube) {
			this.set('position', {x : cube.x, y : cube.y, z : cube.z});
		}
	})
});
