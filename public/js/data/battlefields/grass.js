define('data/battlefields/grass', [
	'gridlib/grid',
	'gridlib/cube',
	'enum/obstacle_types'
], function(
	Grid,
	Cube,
	obstacleTypesEnum
) {
	var HOR_HEX_COUNT = 15,
		VER_HEX_COUNT = 11;

	var GRID_OFFSET_X = 103,
		GRID_OFFSET_Y = 132,
		CANVAS_WIDTH = 800,
		CANVAS_HEIGHT = 556;

	var FRAME_LIFE_TIME = 45;//ms

	function getObstacles() {
		//The borders represents obstacles which are not visible on the map. They are around the battlefield grid to create
		//a virtual wall for the script which calculates path for unit to walk on

		var top_border = [],
			bottom_border = [];
		var hor_count = 15 + 2,
			ver_count = 11;

		for(var i = 0, l = hor_count; i < l; i++) {
			top_border.push({position : {x : i, y : 1 - i, z : -1}, type : obstacleTypesEnum.FAKE_BORDER});
			bottom_border.push({position : {x : i - 6, y : - 5 - i, z : ver_count + 1}, type : obstacleTypesEnum.FAKE_BORDER});
		}

		var left_border = [
			{position : {x : -1, y : 1, z : 0}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : -2, y:  1, z : 1}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : -2, y : 0, z : 2}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : -3, y:  0, z : 3}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : -3, y : -1, z : 4}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : -4, y : -1, z : 5}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : -4, y : -2, z : 6}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : -5, y : -2, z : 7}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : -5, y : -3, z : 8}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : -6, y : -3, z : 9}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : -6, y : -4, z : 10}, type : obstacleTypesEnum.FAKE_BORDER}
		];

		var right_border = [
			{position : {x : 15, y : -15, z : 0}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : 14, y : -15, z : 1}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : 14, y : -16, z : 2}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : 13, y : -16, z : 3}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : 13, y : -17, z : 4}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : 12, y : -17, z : 5}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : 12, y : -18, z : 6}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : 11, y : -18, z : 7}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : 11, y : -19, z : 8}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : 10, y : -19, z : 9}, type : obstacleTypesEnum.FAKE_BORDER},
			{position : {x : 10, y : -20, z : 10}, type : obstacleTypesEnum.FAKE_BORDER}
		];

		var obstacles = [
			{position : {x : 2, y : -4, z : 2}, type : obstacleTypesEnum.GRASS_OBSTACLE1}/*,
			{position : {x : 1, y : -4, z : 3}},
			{position : {x : 0, y : -2, z : 2}}*/
		];

		//Blocking the start
		return obstacles.concat(top_border, left_border, right_border, bottom_border);
	}

	return {
		GRID_OFFSET_X : GRID_OFFSET_X,
		GRID_OFFSET_Y : GRID_OFFSET_Y,
		CANVAS_WIDTH : CANVAS_WIDTH,
		CANVAS_HEIGHT : CANVAS_HEIGHT,
		FRAME_LIFE_TIME : FRAME_LIFE_TIME,

		obstacles : getObstacles(),
		shape : Grid.trapezoidalShape(0, HOR_HEX_COUNT - 1, 0, VER_HEX_COUNT - 1, Grid.evenRToCube)
	};
});