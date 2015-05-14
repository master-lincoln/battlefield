(function() {
	var HxOverrides = function() {

	};

	HxOverrides.iter = function(a) {
		return {
			cur : 0,
			arr : a,
			hasNext : function() {
				return this.cur < this.arr.length;
			},
			next : function() {
				return this.arr[this.cur++];
			}
		};
	};

	window.HxOverrides = HxOverrides;
}());


