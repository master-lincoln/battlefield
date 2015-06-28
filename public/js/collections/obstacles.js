define('collection/obstacles', [
	'backbone',
	'model/obstacle'
], function(
	Backbone,
	ObstacleModel
) {
	return Backbone.Collection.extend({
		model : ObstacleModel,

		isObstacle : function(cube) {
			return this.find(function(obstacle) {
				var obstacle_cube = obstacle.getCube();

				return obstacle_cube.x === cube.x && obstacle_cube.y === cube.y && obstacle_cube.z === cube.z;
			}) !== undefined;
		},

		getObstacles : function() {
			return this.models;
		},

		addObstacles : function(obstacles) {
			for (var i = 0; i < obstacles.length; i++) {
				var obstacle = this.add(obstacles[i]);
				var cube = obstacle.getCube();

				if (obstacle.isStartingPoint()) {
					var obstacles_hexes = obstacle.getOccupiedTerritory();

					for (var j = 0; j < obstacles_hexes.length; j++) {
						if (!cube.equals(obstacles_hexes[j])) {
							this.add(obstacle.getTerritoryModelDefinition(obstacles_hexes[j]));
						}
					}
				}
			}
		}
	});
});