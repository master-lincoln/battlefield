define('collection/battlefield_units', [
	'backbone',
	'model/battlefield_unit'
], function(
	Backbone,
	BattlefieldUnitModel
) {
	return Backbone.Collection.extend({
		model : BattlefieldUnitModel,

		getFirstUnit : function getFirstUnit() {
			return this.at(0);
		},

		getUnit : function getUnit(hex) {
			var cube = hex.getCube();

			return this.find(function(unit) {
				var position = unit.getPosition();

				return position.x === cube.x && position.y === cube.y && position.z === cube.z;
			});
		},

		isUnit : function isUnit(hex) {
			return this.getUnit(hex) !== undefined;
		},

		onUnitMovement : function onUnitMovement(obj, callback) {
			obj.listenTo(this, 'change:position', callback);
		}
	});
});