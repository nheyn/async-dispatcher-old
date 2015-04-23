jest.dontMock("babel/polyfill");
require("babel/polyfill");
/*
jest.dontMock('es6-shim');
import 'es6-shim';
//*/

jest.dontMock('../src/dispatcher.js');

describe('Dispatcher', function() {
	it('registers callbacks', function() {
		var dispatcher = makeEmptyDispatcher();
		var callbacks = makeTestCallbacks();

		var symCallbackMap = new Map();
		registerCallbacks(dispatcher, callbacks, function(newSym, i) {
			// Check symbol is unique
			expect(symCallbackMap.has(newSym)).toBe(false);
			symCallbackMap.set(newSym, i);
		});

		symCallbackMap.forEach((callbackIndex, sym) => {
			// Check symbol has been added to dispatcher
			expect(dispatcher._callbacks.has(sym)).toBe(true);

			// Check symbol has the correct callback
			expect(dispatcher._callbacks.get(sym)).toBe(callback[callbackIndex]);
		});
	});

	it('unregisters callbacks', function() {
		var dispatcher = makeEmptyDispatcher();
		var callbacks = makeTestCallbacks();
		var symSet = new Set();
		registerCallbacks(dispatcher, callbacks, (newSym) => symCallbackMap.add(newSym));
	
		symSet.forEach((sym) => {
			var didRemove = dispatcher.unregister(sym);

			// Check unregister returns true when valid sym is removed
			expect(didRemove).toBe(true);

			// Check unregistered callback has been removed from the dispatcher
			expect(dispatcher._callbacks.has(sym)).toBe(false);
		});

		// Check
		expect(dispatcher.unregister(Symbol()).toBe(false)
	});
});

/*------------------------------------------------------------------------------------------------*/
// Helper functions
/*------------------------------------------------------------------------------------------------*/
function makeEmptyDispatcher() {
	var Dispatcher = require('../src/dispatcher.js').Dispatcher;
	return new Dispatcher();
}

function makeTestCallbacks() {
	return [
		(payload) => payload.a? payload: null,
		(payload) => payload.b? payload: {},
		(payload) => payload.c? payload: Promise.resolve(payload)
	];
}

function registerCallbacks(dispatcher, callbacks, onAddCallback) {
	for(var i=0; i<callbacks.length; i++) {
		var newSym = dispatcher.register(callbacks[i]);
		
		if(onAddCallback) onAddCallback(newSym, i);
	}
}		