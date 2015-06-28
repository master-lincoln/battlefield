define('model/battlefield_unit', [
	'backbone',
	'gridlib/cube',
	'data/battlefields/units/all'
], function(
	Backbone,
	Cube,
	allUnitsData
) {
	return Backbone.Model.extend({
		defaults : {
			type : '',
			position : {x : 0, y : 0, z : 0}
		},

		getSpriteData : function() {
			return allUnitsData[this.getType()].sprites;
		},

		getType : function() {
			return this.get('type');
		},

		getCube : function() {
			var position = this.get('position');
			return new Cube(position.x, position.y, position.z);
		},

		getPreviousPosition : function() {
			var position = this._previousAttributes.position;

			return new Cube(position.x, position.y, position.z);
		},

		moveTo : function(cube) {
			this.set('position', {x : cube.x, y : cube.y, z : cube.z});
		},

		getSpeed : function() {
			return 5;
		}
	})
});
