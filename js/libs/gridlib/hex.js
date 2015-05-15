define('gridlib/hex', [], function() {
	'use strict';

	var Hex = function(q,r) {
		this.q = q;
		this.r = r;
	};

	Hex.prototype = {
		toString: function() {
			return this.q + ":" + this.r;
		}
	};

	return Hex;
});