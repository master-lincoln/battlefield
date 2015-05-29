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

		getUnit : function(hex) {
			var cube = hex.getCube();

			return this.find(function(unit) {
				var position = unit.getPosition();

				return position.x === cube.x && position.y === cube.y && position.z === cube.z;
			});
		},

		isUnit : function(hex) {
			return this.getUnit(hex) !== undefined;
		},

		onUnitMovement : function(obj, callback) {
			obj.listenTo(this, 'change:position', callback);
		}
	});
});