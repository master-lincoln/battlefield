define('model/hex', [
	'backbone'
], function(
	Backbone
) {
	/**
	 * cube : cube,
	 * polygon : polygon
	 */
	return Backbone.Model.extend({
		defaults : {

		},

		getCube : function() {
			return this.get('cube');
		},

		getPolygon : function() {
			return this.get('polygon');
		}
	})
});
