requirejs.config({
	baseUrl: 'js',
	paths: {
		jquery: 'libs/jquery-2.1.4.min',
		underscore: 'libs/underscore-min',
		backbone: 'libs/backbone-min',
		d3 : 'libs/d3-min',
		gridlib : 'libs/gridlib',

		view : 'views',
		controller : 'controllers'
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

requirejs(['controller/battlefield'], function(BattlefieldController) {
	var bc = new BattlefieldController({
		el : document.querySelector('#diagram-movement-range')
	});
});