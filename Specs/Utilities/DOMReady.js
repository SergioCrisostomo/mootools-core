/*
---
name: DomReady
requires: ~
provides: ~
...
*/

describe("DOMReady", function(){

	var win, frame, cb, ready;
	
	function checkStatus(){
		ready = win && win.callbackFired;
		if (ready) cb();
		return ready;
	}

	function newFrame(url){
		var iframe = new IFrame({
			src: 'base/Tests/DOMReady/' + url
		});
		document.getElement('body').adopt(iframe);
		return iframe;
	}

	beforeEach(function(){
		cb = jasmine.createSpy('DOMReady!');
	});

	afterEach(function(){
		frame.destroy();
		win = cb = frame = ready = null;
	});

	it('should fire DOMReady when the DOM is ready', function(){
		frame = newFrame('DOMReady.head.html');
		frame.addEvent('load', function(){
			win = frame.contentWindow;
		});
		waitsFor(function(){
			return checkStatus();
		}, "the iframe to load", 1500);
		runs(function(){
			expect(cb).toHaveBeenCalled();
		});
	});

	it('should fire DOMReady when a new `addEvent("domready"` is added', function(){
		frame = newFrame('DOMReady.onAdd.html');
		frame.addEvent('load', function(){
			win = frame.contentWindow;
			win.addEvent('domready', win.callback);
		});
		waitsFor(function(){
			return checkStatus();
		}, "the iframe to load", 1500);
		runs(function(){
			expect(cb).toHaveBeenCalled();
		});
	});

	it('should fire when MooTools was loaded into a already-ready page', function(){
		frame = newFrame('DOMReady.delayed.html');
		var ready;
		frame.addEvent('load', function(){
			win = frame.contentWindow;
			expect(win.MooTools).toBeFalsy(); // because MooTools should not be loaded yet
			var i = setInterval(function(){
				if (win.addEvent && win.callback){
					win.addEvent('domready', win.callback);
					if (ready) clearInterval(i);
				}
			}, 50);
		});
		waitsFor(function(){
			return checkStatus();
		}, "the iframe to load and MooTools to be deployed", 6000);
		runs(function(){
			expect(cb).toHaveBeenCalled();
		});
	});

});
