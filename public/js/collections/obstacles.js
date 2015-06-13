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
		}
	});
});