define('enum/obstacle_types', [], function() {
	return {
		FAKE_BORDER : 'fake_border', //- creates virtual border for algorithm
		OBSTACLE_TERRITORY : 'obstacle_territory', //some obstacles takes more than one hex, so any additional hex is represented by OBSTACLE_TERRITORY
		GRASS_OBSTACLE1 : 'grass_obstacle1',
		GRASS_OBSTACLE2 : 'grass_obstacle2'
	};
});