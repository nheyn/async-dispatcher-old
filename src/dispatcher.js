/**
 * @flow
 */

/*------------------------------------------------------------------------------------------------*/
//	Dispatcher Class
/*------------------------------------------------------------------------------------------------*/
/**
 * A dispatcher that dispatches callbacks and return Promise.
 */
class Dispatcher {
	_callbacks: Map<Symbol, DispatcherFunc>;

	constructor() {
		this._callbacks = new Map();
	}

	/**
	 * Register a new callback.
	 *
	 * @param {DispatchFunc}	callback	The callback to register
	 *
	 * @return {Symbol}						The symbol to use to unregister the callback
	 */
	register(callback: DispatcherFunc): Symbol {
		var newSym = Symbol();
		this._callbacks.set(newSym, callback);
		return newSym;
	}

	/**
	 * Unregister a callback.
	 *
	 * @param {Symbol}	sym	The symbol returned by register for the callback to remove
	 *
	 * @return {bool}		TRUE if the symbol was removed, false if the given symbol is invalid
	 */
	unregister(sym: Symbol): bool {
		return this._callbacks.delete(sym);
	}

	/**
	 * Dispatch the payload to registered callbacks.
	 *
	 * @param {DispatcherPayload}	payload		The payload to send to each of the resisted
	 *											functions
	 *
	 * @return {Promise<Array<DispatcherResponse>>}		A promise that contains an array of results
	 *													from each registered callback
	 */
	dispatch(payload: DispatcherPayload): Promise<Array<DispatcherResponse>> {
		return Promise.all(callbackMapToPromiseArray(payload, this._callbacks));
	}
}

/*------------------------------------------------------------------------------------------------*/
//	Dispatcher Sub-Class
/*------------------------------------------------------------------------------------------------*/
/**
 * The dispatcher sub-class to run on the sever and communicate with the client.
 */
class NetworkDispatcher extends Dispatcher {
	_serverCallbackSymbols: Array<Symbol>;

	constructor() {
		super();
		this._serverCallbackSymbols = [];
	}

	/*--------------------------------------------------------------------------------------------*/
	//	"Private/Protected" Dispatcher Methods
	/*--------------------------------------------------------------------------------------------*/
	_getSeverCallbacks(): Map<Symbol, DispatcherFunc> {
		var callbacks = new Map();
		this._serverCallbackSymbols.forEach((sym) => {
			if(super._callbacks.has(sym)) callbacks.set(sym, super._callbacks.get(sym));
		});
		return callbacks;
	}
}

/**
 * The dispatcher sub-class to run on the sever and communicate with the client.
 */
class ServerDispatcher extends NetworkDispatcher {
	_encode: DispatcherEncodeFunc;

	constructor(encodeCallback: DispatcherEncodeFunc) {
		super();
		this._encode = encodeCallback;
	}

	/**
	 * Register a new callback that needs to run on the server.
	 *
	 * @param {DispatchFunc}	callback	The callback to register
	 *
	 * @return {Symbol}						The symbol to use to unregister the callback
	 */
	registerForServer(callback: DispatcherFunc): Symbol {
		var sym = super.register(callback);
		super._serverCallbackSymbols.push(sym);
		return sym;
	}

	
	/**
	 * Dispatch the payload to callbacks that are registered for the server.
	 *
	 * @param {DispatcherPayload}		payload		The payload to send to each of the resisted 
	 *												functions
	 *
	 * @return {Promise<Array<DispatcherResponse>>}	A promise that contains an array of results from
	 *												each registered callback, that return something.
	 */
	dispatchForSeverRequest(payload: DispatcherPayload): Promise<DispatcherResponse> {
		var callbacks = super._getSeverCallbacks(payload);
		return Promise.all(callbackMapToPromiseArray(payload, callbacks)).then(this._encode);
	}
}

/**
 * The dispatcher sub-class to run on the client and communicate with the server.
 */
class ClientDispatcher extends NetworkDispatcher {
	_sendData: DispatcherSendDataFunc;
	_decode: DispatcherDecodeFunc;
	_serverSymbol: ?Symbol;

	constructor(sendDataCallback: DispatcherSendDataFunc, decodeCallback: DispatcherDecodeFunc) {
		super();
		this._sendData = sendDataCallback;
		this._decode = decodeCallback;
		this._serverSymbol = null;
	}

	/**
	 * Register a new callback that needs to run on the server.
	 *
	 * @param {DispatchFunc}	callback	The callback to register
	 *										NOTE: Ignored on the client side
	 *
	 * @return {Symbol}						The symbol to use to unregister the callback
	 */
	registerForServer(callback: DispatcherFunc): Symbol {
		// Register send callback if this is the first sever callback
		if(!this._serverSymbol) {
			this._serverSymbol = super.register(
				(payload) => Promise.resolve(this._sendData(payload)).then(this._decode)
			);
		}

		// Create reference symbol
		var sym = Symbol();
		super._serverCallbackSymbols.push(sym);
		return sym;
	}

	/*--------------------------------------------------------------------------------------------*/
	//	Dispatcher Method Overrides
	/*--------------------------------------------------------------------------------------------*/
	unregister(sym: Symbol): bool {
		// Check if normal callback was being removed
		var index = super._serverCallbackSymbols.indexOf(sym)
		if(index === -1) return super.unregister(sym);

		// Remove callback symbol
		delete super._serverCallbackSymbols[index];

		// Check if any server callbacks are still registered
		if(super._serverCallbackSymbols.length > 0)	return true;

		// Remove callback if no sever callbacks are still registered
		this._serverSymbol = null;
		return this._serverSymbol? super.unregister(this._serverSymbol): false;
	}
}

/*------------------------------------------------------------------------------------------------*/
//	Helper functions
/*------------------------------------------------------------------------------------------------*/
function callbackMapToPromiseArray(
			payload:	DispatcherPayload, 
			callbacks:	Map<Symbol, DispatcherFunc> 
):						Array<Promise<DispatcherResponse>> {
	var resultPromises = [];
	callbacks.forEach((callback) => {
		var result = callback(payload);
		if(!result) return;

		resultPromises.push(Promise.resolve(result));
	});
	return resultPromises;
}

/*------------------------------------------------------------------------------------------------*/
//	Export
/*------------------------------------------------------------------------------------------------*/
module.exports.Dispatcher = Dispatcher;
module.exports.ServerDispatcher = ServerDispatcher;
module.exports.ClientDispatcher = ClientDispatcher;
