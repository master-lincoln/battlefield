define('data/battlefields/obstacles/all', [
	'enum/obstacle_types'
], function(
	obstacleTypesEnum
) {
	var data = {};

	data[obstacleTypesEnum.GRASS_OBSTACLE1] = {
		url : 'images/battlefield/obstacles/grass_obstacle1.png',
		width : 275,
		height : 53,
		hexes : [
			{x : 0, y : 0, z : 0},
			{x : 1, y : -1, z : 0},
			{x : 2, y : -2, z : 0},
			{x : 3, y : -3, z : 0},
			{x : 4, y : -4, z : 0}
		]
	};

	data[obstacleTypesEnum.GRASS_OBSTACLE2] = {
		url : 'images/battlefield/obstacles/grass_obstacle2.png',
		width : 43,
		height : 47,
		hexes : [
			{x : 0, y : 0, z : 0}
		]
	};

	return data;
});