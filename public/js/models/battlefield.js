define('model/battlefield', [
	'backbone',
	'gridlib/cube'
], function(
	Backbone,
	Cube
) {
	return Backbone.Model.extend({
		defaults : {
			cursor_position : {x : null, y : null, z : null},
			active_unit : null
		},

		getCursorPosition : function() {
			var position = this.get('cursor_position');
			return position.x === null && position.y === null && position.z === null ? null : new Cube(position.x, position.y, position.z);
		},

		moveCursorTo : function(cube) {
			this.set('cursor_position', {x : cube.x, y : cube.y, z : cube.z});
		},

		setActiveUnit : function(battlefield_unit) {
			this.set('active_unit', battlefield_unit);
		},

		getActiveUnit : function() {
			return this.get('active_unit');
		},

		onCursorPositionChange : function(obj, callback) {
			obj.listenTo(this, 'change:cursor_position', callback);
		},

		onActiveUnitChange : function(obj, callback) {
			obj.listenTo(this, 'change:active_unit', callback);
		}
	})
});
