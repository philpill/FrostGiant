var requires = [
	'js/BBN.EaselJS',
	'js/BBN.Entities',
	'js/BBN.Game',
	'js/BBN.Grid',
	'js/BBN.Helpers',
	'js/BBN.Pitch',
	'js/BBN.Player',
	'js/BBN.RenderEngine',
	'js/BBN.Team',
	'js/BBN.Variables',
	'js/lib/EaselJS/lib/easel',
	'js/lib/AStar',
	'js/lib/jquery-1.7.1.min',
	'js/lib/modernizr',
	'js/lib/jasmine-1.1.0/jasmine',
	'js/lib/jasmine-1.1.0/jasmine-html'
];

require(requires, function() {
	$(BBN.init());	
});