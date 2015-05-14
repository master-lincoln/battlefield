(function() {
	'use strict';

	var Lambda = function() {

	};

	Lambda.array = function(it) {
		var a = [];
		var $it0 = $iterator(it)();

		while ($it0.hasNext()) {
			var i = $it0.next();
			a.push(i);
		}

		return a;
	};

	window.Lambda = Lambda;
}());