jest.dontMock('../src/dispatcher.js');

describe('Dispatcher', function() {
	it('registers callbacks', function() {
		var dispatcher = makeEmptyDispatcher();
		var callbacks = makeTestCallbacks();

		var symCallbackMap = new Map();
		for(var i=0; i<callbacks.length; i++) {
			var newSym = dispatcher.register(callbacks[i]);

			// Check symbol is unique
			expect(symCallbackMap.has(newSym)).toBe(false);

			symCallbackMap.set(newSym, i);
		}

		symCallbackMap.forEach((callbackIndex, sym) => {
			// Check symbol has been added to dispatcher
			expect(dispatcher._callbacks.has(sym)).toBe(true);

			// Check symbol has the correct callback
			expect(dispatcher._callbacks.get(sym)).toBe(callback[callbackIndex]);
		});
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