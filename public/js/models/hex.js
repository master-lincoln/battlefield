define('model/hex', [
	'backbone'
], function(
	Backbone
) {
	/**
	 * cube : cube,
	 * tile : tile,
	 * polygon : polygon,
	 * label : label
	 */
	return Backbone.Model.extend({
		defaults : {

		},

		getCube : function() {
			return this.get('cube');
		},

		getLabel : function() {
			return this.get('label');
		},

		getTile : function() {
			return this.get('tile');
		},

		getPolygon : function() {
			return this.get('polygon');
		}
	})
});
