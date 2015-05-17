define('collection/obstacles', [
	'backbone',
	'model/obstacle'
], function(
	Backbone,
	ObstacleModel
) {
	return Backbone.Collection.extend({
		model : ObstacleModel,

		hasObstacle : function(cube) {
			return this.findWhere({
				x : cube.x,
				y : cube.y,
				x : cube.x
			}) !== undefined;
		}
	});
});