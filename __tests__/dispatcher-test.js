/*jest.dontMock("babel/polyfill");
require("babel/polyfill");

$ docker run -v "$(pwd)"/src:/var/www/src -v "$(pwd)"/__tests__:/var/www/__tests__ -it --rm dispatcher jest
Using Jest CLI v0.4.0
 FAIL  __tests__/dispatcher-test.js
TypeError: /var/www/__tests__/dispatcher-test.js: /var/www/node_modules/babel/polyfill.js: /var/www/node_modules/babel/node_modules/babel-core/polyfill.js: /var/www/node_modules/babel/node_modules/babel-core/lib/babel/polyfill.js: /var/www/node_modules/babel/node_modules/babel-core/node_modules/core-js/shim.js: /var/www/node_modules/babel/node_modules/babel-core/node_modules/core-js/modules/es5.js: /var/www/node_modules/babel/node_modules/babel-core/node_modules/core-js/modules/$.cof.js: /var/www/node_modules/babel/node_modules/babel-core/node_modules/core-js/modules/$.wks.js: Cannot read property 'g' of undefined
1 test failed, 0 tests passed (1 total)
Run time: 2.819s
*/


/*jest.dontMock('es6-shim');
import 'es6-shim';

$ docker run -v "$(pwd)"/src:/var/www/src -v "$(pwd)"/__tests__:/var/www/__tests__ -it --rm dispatcher bash
root@705fd1e337f3:/var/www# npm install es6-shim
npm WARN package.json dispatcher@0.1.0 No repository field.
npm WARN package.json dispatcher@0.1.0 No README data
npm WARN package.json flow@0.2.3 No repository field.
es6-shim@0.28.1 node_modules/es6-shim
root@705fd1e337f3:/var/www# jest
Using Jest CLI v0.4.0
 FAIL  __tests__/dispatcher-test.js
TypeError: /var/www/__tests__/dispatcher-test.js: /var/www/node_modules/es6-shim/es6-shim.js: Object #<Map> has no method 'keys'
1 test failed, 0 tests passed (1 total)
Run time: 2.663s
*/

jest.dontMock('../src/dispatcher.js');

describe('Dispatcher', function() {
	it('registers callbacks', function() {
		/*var dispatcher = makeEmptyDispatcher();
		var callbacks = makeTestCallbacks();*/

		var symCallbackMap = new Map();
		/*for(var i=0; i<callbacks.length; i++) {
			var newSym = dispatcher.register(callbacks[i]);

			// Check symbol is unique
			expect(symCallbackMap.has(newSym)).toBe(false);

			symCallbackMap.set(newSym, i);
		}*/

		symCallbackMap.forEach((callbackIndex, sym) => {/*
			// Check symbol has been added to dispatcher
			expect(dispatcher._callbacks.has(sym)).toBe(true);

			// Check symbol has the correct callback
			expect(dispatcher._callbacks.get(sym)).toBe(callback[callbackIndex]);*/
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