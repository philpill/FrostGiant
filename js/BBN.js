var requires = [
	'js/BBN.EaselJS',
	'js/BBN.BlockEngine',
	'js/BBN.Entities',
	'js/BBN.Game',
	'js/BBN.Grid',
	'js/BBN.Helpers',
	'js/BBN.Pitch',
	'js/BBN.Player',
	'js/BBN.RenderEngine',
	'js/BBN.Team',
	'js/BBN.UserEvents',
	'js/BBN.Variables',
	'js/lib/EaselJS/lib/easeljs-0.4.2.min',
	'js/lib/AStar',
	'js/lib/jquery.min',
	'js/lib/modernizr'
];

require(requires, function() {
	$(BBN.init());	
});