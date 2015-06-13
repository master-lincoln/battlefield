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

		getHex : function(x, y, z) {
			//When used Cube instead of x,y,z I could feel drop of performance
			var hexes = this.getHexes();

			for(var i = 0, l = hexes.length; i < l; i++) {
				var cube = hexes[i].getCube();

				if (cube.x === x && cube.y === y && cube.z === z) {
					return hexes[i];
				}
			}

			return null;
		},

		getHexByScreenCoordinate : function(point) {
			return this.find(function(hex) {
				return hex.getPolygon().containsPoint(point);
			});
		}
	});
});