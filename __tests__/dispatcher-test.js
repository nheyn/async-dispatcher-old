jest.dontMock('../src/dispatcher.js');

describe('Dispatcher', function() {
	it('registers callbacks', function() {
		//TODO, debug test
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
			expect(dispatcher._callbacks.get(sym)).toBe(callbacks[callbackIndex]);
		});
	});

	it('unregisters callbacks', function() {
		//TODO, debug test
		var dispatcher = makeEmptyDispatcher();
		var callbacks = makeTestCallbacks();
		var symSet = new Set();
		registerCallbacks(dispatcher, callbacks, (newSym) => symSet.add(newSym));
	
		symSet.forEach((sym) => {
			// Check unregister returns true when valid sym is given
			expect(dispatcher.unregister(sym)).toBe(true);

			// Check unregistered callback has been removed from the dispatcher
			expect(dispatcher._callbacks.has(sym)).toBe(false);
		});

		// Check unregister returns false when an invalid sym is given
		var someSym = Symbol();
		expect(dispatcher.unregister(someSym)).toBe(false);
	});

	it('dispatch to one callbacks', function() {
		//TODO
	});

	it('dispatch to all callbacks', function() {
		//TODO
	});

	it('dispatcher to some callbacks', function() {
		//TODO
	});

	it('dispatch to none of the callbacks', function() {
		//TODO
	});

	it('dispatch to empty dispatcher', function() {
		//TODO, new dispatcher

		//TODO, filled and empty dispatcher
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
		(payload) => payload.b? { payload }: null,
		(payload) => payload.c? Promise.resolve(payload): Promise.reject(new Error('No .c'))
	];
}

function registerCallbacks(dispatcher, callbacks, onAddCallback) {
	for(var i=0; i<callbacks.length; i++) {
		var newSym = dispatcher.register(callbacks[i]);
		
		if(onAddCallback) onAddCallback(newSym, i);
	}
}		