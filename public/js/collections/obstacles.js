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
				var position = obstacle.getPosition();

				return position.x === cube.x && position.y === cube.y && position.z === cube.z;
			}) !== undefined;
		}
	});
});