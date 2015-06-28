define('model/obstacle', [
	'backbone',
	'gridlib/cube',
	'enum/obstacle_types',
	'data/battlefields/obstacles/all'
], function(
	Backbone,
	Cube,
	obstacleTypesEnum,
	battlefieldsObstacles
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

		getType : function() {
			return this.get('type');
		},

		isFakeBorder : function() {
			return this.getType() === obstacleTypesEnum.FAKE_BORDER;
		},

		isStartingPoint : function() {
			var type = this.getType();

			return type !== obstacleTypesEnum.FAKE_BORDER && type !== obstacleTypesEnum.OBSTACLE_TERRITORY;
		},

		getCube : function() {
			var position = this.get('position');
			return new Cube(position.x, position.y, position.z);
		},

		getDefinition : function() {
			return battlefieldsObstacles[this.getType()];
		},

		getOccupiedTerritory : function() {
			var hexes = this.getDefinition().hexes;
			var territory = [];

			for (var i = 0; i < hexes.length; i++) {
				territory.push(Cube.add(this.getCube(), hexes[i]));
			}

			return territory;
		},

		getTerritoryModelDefinition : function(position) {
			return {
				position : position,
				type : obstacleTypesEnum.OBSTACLE_TERRITORY
			};
		}
	})
});
