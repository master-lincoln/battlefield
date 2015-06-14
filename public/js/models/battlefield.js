define('model/battlefield', [
	'backbone',
	'gridlib/cube'
], function(
	Backbone,
	Cube
) {
	return Backbone.Model.extend({
		defaults : {
			active_unit : null
		},

		setActiveUnit : function(battlefield_unit) {
			this.set('active_unit', battlefield_unit);
		},

		getActiveUnit : function() {
			return this.get('active_unit');
		},

		onActiveUnitChange : function(obj, callback) {
			obj.listenTo(this, 'change:active_unit', callback);
		}
	})
});
