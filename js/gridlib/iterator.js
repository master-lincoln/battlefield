(function() {
	'use strict';

	var $fid = 0;

	function $bind(o,m) {
		if (m == null) {
			return null;
		}

		if (m.__id__ == null) {
			m.__id__ = $fid++;
		}

		var f;

		if (o.hx__closures__ == null) {
			o.hx__closures__ = {};
		} else {
			f = o.hx__closures__[m.__id__];
		}

		if (f == null) {
			f = function () {
				return f.method.apply(f.scope, arguments);
			};
			f.scope = o;
			f.method = m;
			o.hx__closures__[m.__id__] = f;
		}

		return f;
	}

	function $iterator(o) {
		if (o instanceof Array) {
			return function() {
				return HxOverrides.iter(o);
			};
		}

		return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator;
	}

	window.$iterator = $iterator;
}());