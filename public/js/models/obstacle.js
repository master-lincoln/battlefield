define('model/obstacle', [
	'backbone',
	'gridlib/cube',
	'enum/obstacle_types'
], function(
	Backbone,
	Cube,
	obstacleTypesEnum
) {
	return Backbone.Model.extend({
		/**
		 * type
		 *    - fake_border - creates virtual border for algorithm
		 */
		defaults : {
			position : {
				x : 0, y : 0, z : 0
			},
			type : ''
		},

		getPosition : function() {
			return this.getCube();
		},

		getType : function() {
			return this.get('type');
		},

		isFakeBorder : function() {
			return this.getType() === obstacleTypesEnum.FAKE_BORDER;
		},

		getCube : function() {
			var position = this.get('position');
			return new Cube(position.x, position.y, position.z);
		}
	})
});
