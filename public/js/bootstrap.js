requirejs.config({
	baseUrl: 'js',
	paths: {
		jquery: 'libs/jquery-2.1.4.min',
		underscore: 'libs/underscore-min',
		backbone: 'libs/backbone-min',
		gridlib : 'libs/gridlib',
		d3 : 'libs/d3.min',

		view : 'views',
		controller : 'controllers',
		provider : 'providers',
		manager : 'managers',
		model : 'models',
		collection : 'collections',
		enum : 'enums',
		helper : 'helpers',

		map : 'data/maps',
		unit : 'data/units'
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
	'model/battlefield',
	'map/default'
], function(
	BattlefieldController,
	ObstaclesCollection,
	HexesCollection,
	BattlefieldUnitsCollection,
	Battlefield,
	map
) {

	function getBattlefieldUnits() {
		return [
			{type : 'hobgoblin', position : {x : 1, y : -3, z : 2}}/*,
			{type : 'hobgoblin', position : {x : 2, y : -2, z : 0}}*/
		];
	}

	var obstacles = new ObstaclesCollection(map.obstacles);
	var hexes = new HexesCollection();
	var battlefield_units = new BattlefieldUnitsCollection(getBattlefieldUnits());
	var battlefield = new Battlefield();

	var bc = new BattlefieldController({
		el : document.querySelector('#battlefield'),
		collections : {
			obstacles : obstacles,
			hexes : hexes,
			battlefield_units : battlefield_units
		},

		models : {
			battlefield : battlefield
		},
		map : map
	});
});