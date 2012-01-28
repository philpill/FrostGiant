
var Helpers = {

	//http://helephant.com/2009/11/29/javascript-method-context/
	addEvent: function(element, eventName, handler, context)
	{
	    var wrapper = handler;
	    if(context)
	    {
	        // create an anonymous function
	        // that uses a closure to access the context parameter
	        // and then uses Function.call() to invoke the real event handler
	        wrapper = function(e) {
	            handler.call(context, e);
	        }
	    }
	    if(element.addEventListener)
	        element.addEventListener(eventName, wrapper, false);
	    else if(element.attachEvent)
	        element.attachEvent("on" + eventName, wrapper);
	},
	wrapFunction: function(fn, context, params) {
		return function() {
			fn.apply(context, params);
		};
	},
	convertPixelsToGrids: function(x, y, unit) {
		return [Math.ceil(x/unit), Math.ceil(y/unit)];
	},
	convertGridsToPixels: function(gridX, gridY, unit) {
		return [gridX*unit-unit, gridY*unit-unit];
	},
	castPlayerHelper: function(array) {
		var i;
		for (i = 0; i < array.length; i++) {
			if (array[i] instanceof BBN.Player) {
				return array[i];
			}
		}
		return null;		
	},
	castBallHelper: function(array)  {
		var i;
		for (i = 0; i < array.length; i++) {
			if (array[i] instanceof BBN.Ball) {
				return array[i];
			}
		}
		return null;		
	},
	castGridEntityHelper: function(array) {
		var i, entityArray = [];
		for (i = 0; i < array.length; i++) {
			if (array[i] instanceof BBN.Player || array[i] instanceof BBN.Ball) {
				entityArray.push(array[i]);
			}
		}
		return entityArray;		
	}
}