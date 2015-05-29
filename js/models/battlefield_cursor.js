define('model/battlefield_cursor', [
	'backbone',
	'gridlib/cube'
], function(
	Backbone,
	Cube
) {
	return Backbone.Model.extend({
		defaults : {
			position : {x : null, y : null, z : null}
		},

		getPosition : function() {
			var position = this.get('position');
			return position.x === null && position.y === null && position.z === null ? null : new Cube(position.x, position.y, position.z);
		},

		moveTo : function(cube) {
			this.set('position', {x : cube.x, y : cube.y, z : cube.z});
		},

		onPositionChange : function(obj, callback) {
			obj.listenTo(this, 'change:position', callback);
		}
	})
});
