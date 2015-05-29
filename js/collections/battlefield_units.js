define('collection/battlefield_units', [
	'backbone',
	'model/battlefield_unit'
], function(
	Backbone,
	BattlefieldUnitModel
) {
	return Backbone.Collection.extend({
		model : BattlefieldUnitModel,

		getFirstUnit : function() {
			return this.at(0);
		},

		onUnitMovement : function(obj, callback) {
			obj.listenTo(this, 'change:position', callback);
		}
	});
});