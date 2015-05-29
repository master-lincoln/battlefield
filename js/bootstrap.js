requirejs.config({
	baseUrl: 'js',
	paths: {
		jquery: 'libs/jquery-2.1.4.min',
		underscore: 'libs/underscore-min',
		backbone: 'libs/backbone-min',
		d3 : 'libs/d3-min',
		gridlib : 'libs/gridlib',

		view : 'views',
		controller : 'controllers',
		provider : 'providers',
		manager : 'managers',
		model : 'models',
		collection : 'collections',

		map : 'data/maps'
	},
	'shim': {
		'underscore': {
			'exports': '_'
		},
		'backbone': {
			'deps': ['jquery', 'underscore'],
			'exports': 'Backbone'
		}
	}
});

requirejs([
	'controller/battlefield',
	'collection/obstacles',
	'collection/hexes',
	'collection/battlefield_units',
	'map/default'
], function(
	BattlefieldController,
	ObstaclesCollection,
	HexesCollection,
	BattlefieldUnitsCollection,
	map
) {


	function getBattlefieldUnits() {
		return [
			{position : {x : 1, y : -3, z : 2}},
			{position : {x : 2, y : -2, z : 0}}
		];
	}

	var obstacles = new ObstaclesCollection(map.obstacles);
	var hexes = new HexesCollection();
	var battlefield_units = new BattlefieldUnitsCollection(getBattlefieldUnits());

	var bc = new BattlefieldController({
		el : document.querySelector('#diagram-movement-range'),
		collections : {
			obstacles : obstacles,
			hexes : hexes,
			battlefield_units : battlefield_units
		}
	});
});