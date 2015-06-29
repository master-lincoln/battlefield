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
		'class' : 'classes'
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
	'data/battlefields/grass',
	'libs/polyfill/request_animation_frame'
], function(
	BattlefieldController,
	ObstaclesCollection,
	HexesCollection,
	BattlefieldUnitsCollection,
	Battlefield,
	BattlefieldData,
	request_anim_frame
) {

	function getBattlefieldUnits() {
		return [
			//{type : 'hobgoblin', position : {x : -4, y : 3, z : 7}},
			{type : 'hobgoblin', position : {x : 0, y : 0, z : 0}}/*,
			{type : 'hobgoblin', position : {x : -2, y : 5, z : 7}},
			{type : 'hobgoblin', position : {x : 0, y : -7, z : 7}},
			{type : 'hobgoblin', position : {x : 2, y : -9, z : 7}},
			{type : 'hobgoblin', position : {x : 4, y : -11, z : 7}}*/
		];
	}

	var obstacles = new ObstaclesCollection();
		obstacles.addObstacles(BattlefieldData.obstacles);
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
		map : BattlefieldData
	});
});