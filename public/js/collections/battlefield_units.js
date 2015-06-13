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

		getUnits : function() {
			return this.models;
		},

		getUnit : function getUnit(hex) {
			var cube = hex.getCube();

			return this.find(function(unit) {
				var unit_cube = unit.getCube();

				return unit_cube.x === cube.x && unit_cube.y === cube.y && unit_cube.z === cube.z;
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