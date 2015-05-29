define('map/default', [

], function(

) {
	function getObstacles() {
		var top_border = [],
			bottom_border = [];
		var hor_count = 15 + 2,
			ver_count = 11;

		for(var i = 0, l = hor_count; i < l; i++) {
			top_border.push({position : {x : i, y : 1 - i, z : -1}});
			bottom_border.push({position : {x : i - 6, y : - 5 - i, z : ver_count + 1}});
		}

		var left_border = [
			{position : {x : -1, y : 1, z : 0}},
			{position : {x : -2, y:  1, z : 1}},
			{position : {x : -2, y : 0, z : 2}},
			{position : {x : -3, y:  0, z : 3}},
			{position : {x : -3, y : -1, z : 4}},
			{position : {x : -4, y : -1, z : 5}},
			{position : {x : -4, y : -2, z : 6}},
			{position : {x : -5, y : -2, z : 7}},
			{position : {x : -5, y : -3, z : 8}},
			{position : {x : -6, y : -3, z : 9}},
			{position : {x : -6, y : -4, z : 10}}
		];

		var right_border = [
			{position : {x : 15, y : -15, z : 0}},
			{position : {x : 14, y : -15, z : 1}},
			{position : {x : 14, y : -16, z : 2}},
			{position : {x : 13, y : -16, z : 3}},
			{position : {x : 13, y : -17, z : 4}},
			{position : {x : 12, y : -17, z : 5}},
			{position : {x : 12, y : -18, z : 6}},
			{position : {x : 11, y : -18, z : 7}},
			{position : {x : 11, y : -19, z : 8}},
			{position : {x : 10, y : -19, z : 9}},
			{position : {x : 10, y : -20, z : 10}}
		];

		var obstacles = [
			{position : {x : 2, y : -4, z : 2}},
			{position : {x : 1, y : -4, z : 3}},
			{position : {x : 0, y : -2, z : 2}}
		];

		//Blocking the start
		return obstacles.concat(top_border, left_border, right_border, bottom_border);
	}

	return {
		obstacles : getObstacles()
	};
});