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
			return this.findWhere({
				x : cube.x,
				y : cube.y,
				x : cube.x
			}) !== undefined;
		}
	});
});