define('model/hex', [
	'backbone'
], function(
	Backbone
) {
	/**
	 * cube : cube,
	 * tile : tile,
	 * polygon : polygon
	 */
	return Backbone.Model.extend({
		defaults : {

		},

		getCube : function() {
			return this.get('cube');
		},

		getTile : function() {
			return this.get('tile');
		},

		getPolygon : function() {
			return this.get('polygon');
		}
	})
});
