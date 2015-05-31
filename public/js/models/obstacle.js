define('model/obstacle', [
	'backbone',
	'gridlib/cube'
], function(
	Backbone,
	Cube
) {
	return Backbone.Model.extend({
		defaults : {
			position : {
				x : 0, y : 0, z : 0
			}
		},

		getPosition : function() {
			var position = this.get('position');
			return new Cube(position.x, position.y, position.z);
		}
	})
});
