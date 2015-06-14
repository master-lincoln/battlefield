define('collection/hexes', [
	'backbone',
	'model/hex'
], function(
	Backbone,
	HexModel
) {
	return Backbone.Collection.extend({
		model : HexModel,

		/**
		 *
		 * @param hexes
		 * @param [silent]
		 */
		addHexes : function(hexes, silent) {
			this.add(hexes, {
				silent : silent || false
			});

			return this.models;
		},

		getHexes : function() {
			return this.models;
		},

		getHexByScreenCoordinate : function(point) {
			return this.find(function(hex) {
				return hex.getPolygon().containsPoint(point);
			});
		}
	});
});