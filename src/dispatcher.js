/**
 * @flow
 */

/*------------------------------------------------------------------------------------------------*/
//	--- Dispatcher Class ---
/*------------------------------------------------------------------------------------------------*/
/**
 * A dispatcher that dispatches callbacks and return Promise.
 */
function Dispatcher() {
	this._callbacks = new Map();
	this._basePayload = {};
}

/*------------------------------------------------------------------------------------------------*/
//	Dispatcher Methods
/*------------------------------------------------------------------------------------------------*/
/**
 * Register a new callback.
 *
 * @param {DispatchFunc}	callback	The callback to register
 *
 * @return {Symbol}						The symbol to use to unregister the callback
 */
Dispatcher.prototype.register = function(callback: DispatcherFunc): Symbol {
	var newSym = Symbol();
	this._callbacks.set(newSym, callback);
	return newSym;
};

/**
 * Unregister a callback.
 *
 * @param {Symbol}	sym	The symbol returned by register for the callback to remove
 *
 * @return {bool}		TRUE if the symbol was removed, false if the given symbol is invalid
 */
Dispatcher.prototype.unregister = function(sym: Symbol): bool {
	return this._callbacks.delete(sym);
};

/**
 * Dispatch the payload to registered callbacks.
 *
 * @param {DispatcherPayload}	payload				The payload to send to each of the resisted
 *													functions
 *
 * @return {Promise<Array<DispatcherResponse>>}		A promise that contains an array of results
 *													from each registered callback
 */
Dispatcher.prototype.dispatch = function(payload:	DispatcherPayload)
												:	Promise<Array<DispatcherResponse>> {
	return Promise.all(callbackMapToPromiseArray(
		this._getCombinedPayload(payload),
		this._callbacks
	));
};

/**
 * Get a new dispatcher that adds the given payload (using 'Object.assign') when '.dispatch' is
 * called.
 *
 * @param {DispatcherPayload}	payload	The payload to add to '.dispatch' calls
 *
 * @return {Dispatcher}			The cloned dispatcher
 */
Dispatcher.prototype.cloneWithPayload = function(payload: DispatcherPayload): Dispatcher {
	var clonedDispatcher = new Dispatcher();
	clonedDispatcher._basePayload = this._getCombinedPayload(payload);
	clonedDispatcher._callbacks = this._callbacks;

	return clonedDispatcher;
};

Dispatcher.prototype._getCombinedPayload = function(payload: DispatcherPayload): DispatcherPayload {
	return Object.assign({}, this._basePayload, payload);
};

/*------------------------------------------------------------------------------------------------*/
//	--- Sever Dispatcher Class ---
/*------------------------------------------------------------------------------------------------*/
type ServerDispatcherSettings = {
	dispatcher: Dispatcher;
	encode: DispatcherEncodeFunc;
};

/**
 * The dispatcher sub-class to run on the sever and communicate with the client.
 */
function ServerDispatcher(settings: ServerDispatcherSettings) {
	this._dispatcher = settings.dispatcher;
	this._encode = settings.encode;
	this._serverCallbacks = [];
}

/*------------------------------------------------------------------------------------------------*/
//	Sever Dispatcher Class Proxy Methods of Dispatcher Methods
/*------------------------------------------------------------------------------------------------*/
ServerDispatcher.prototype.register = function(callback: DispatcherFunc): Symbol {
	return this._dispatcher.register(callback);
};

ServerDispatcher.prototype.unregister = function(sym: Symbol): bool {
	return this._dispatcher.unregister(sym);
};

ServerDispatcher.prototype.dispatch = function(payload:	DispatcherPayload)
													:	Promise<Array<DispatcherResponse>> {
	return this._dispatcher.dispatch(payload);
};

ServerDispatcher.prototype.cloneWithPayload = function(payload: DispatcherPayload)
																				: ServerDispatcher {
	var clonedDispatcher = new ServerDispatcher({
		dispatcher: this._dispatcher.cloneWithPayload(payload),
		encode: this._encode
	});
	clonedDispatcher._serverCallbacks = this._serverCallbacks;

	return clonedDispatcher;
};

/*------------------------------------------------------------------------------------------------*/
//	Sever Dispatcher Methods
/*------------------------------------------------------------------------------------------------*/
/**
 * Register a new callback that needs to run on the server.
 *
 * @param {DispatchFunc}	callback	The callback to register
 *
 * @return {Symbol}						The symbol to use to unregister the callback
 */
ServerDispatcher.prototype.registerForServer = function(callback: DispatcherFunc): Symbol {
	var newSym = this._dispatcher.register(callback);
	this._serverCallbacks.push(newSym);
	return newSym;
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
ServerDispatcher.prototype.dispatchForSeverRequest = function(payload:	DispatcherPayload)
																	: Promise<DispatcherResponse> {
	var callbacks = getCallbacksFor(this._dispatcher, this._serverCallbacks);
	return Promise.all(callbackMapToPromiseArray(
		this._dispatcher._getCombinedPayload(payload),
		callbacks
	)).then(this._encode);
}

/*------------------------------------------------------------------------------------------------*/
//	--- Client Dispatcher Class ---
/*------------------------------------------------------------------------------------------------*/
type ClientDispatcherSettings = {
	dispatcher: Dispatcher;
	sendData: DispatcherSendDataFunc;
	decode: DispatcherDecodeFunc;
};

/**
 * The dispatcher sub-class to run on the client and communicate with the server.
 */
function ClientDispatcher(settings: ClientDispatcherSettings) {
	this._dispatcher = settings.dispatcher;
	this._sendData = settings.sendData;
	this._decode = settings.decode;
	this._serverCallbacks = [];
}

/*------------------------------------------------------------------------------------------------*/
//	Client Dispatcher Class Proxy Methods of Dispatcher Methods
/*------------------------------------------------------------------------------------------------*/
ClientDispatcher.prototype.register = function(callback: DispatcherFunc): Symbol {
	return this._dispatcher.register(callback);
};

ClientDispatcher.prototype.unregister = function(sym: Symbol): bool {
	// Check if normal callback is being removed
	var index = this._serverCallbacks.indexOf(sym);
	if(index === -1) return this._dispatcher.unregister(sym);

	// Remove callback symbol
	delete this._serverCallbacks[index];
	return true;
};

ClientDispatcher.prototype.dispatch = function(payload:	DispatcherPayload)
													:	Promise<Array<DispatcherResponse>> {
	return this._dispatcher.dispatch(payload).then((clientResults) => {
		// If server does not need to be called, then just return client results
		if(this._serverCallbacks.length === 0) return clientResults;

		// Append server results to client results
		return this.dispatchToServer(payload).then((serverResults) => {
			return clientResults.concat(serverResults);
		});
	});
};

ClientDispatcher.prototype.cloneWithPayload = function(payload: DispatcherPayload)
																				: ClientDispatcher {
	var clonedDispatcher = new ClientDispatcher({
		dispatcher: this._dispatcher.cloneWithPayload(payload),
		sendData: this._sendData,
		decode: this._decode,
	});
	clonedDispatcher._serverCallbacks = this._serverCallbacks;

	return clonedDispatcher;
};

/*------------------------------------------------------------------------------------------------*/
//	Sever Dispatcher Methods
/*------------------------------------------------------------------------------------------------*/
/**
 * Register a new callback that needs to run on the server.
 *
 * @param {DispatchFunc}	callback	The callback to register
 *										NOTE: Ignored on the client side
 *
 * @return {Symbol}						The symbol to use to unregister the callback
 */
ClientDispatcher.prototype.registerForServer = function(callback: DispatcherFunc): Symbol {
	// Create reference symbol
	var sym = Symbol();
	this._serverCallbacks.push(sym);
	return sym;
};

ClientDispatcher.prototype.dispatchToServer = function(payload: JsonObject) {
	return Promise.resolve(this._sendData(payload)).then(this._decode);
};

/*------------------------------------------------------------------------------------------------*/
//	--- Helper functions ---
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

function getCallbacksFor(dispatcher: Dispatcher, syms: Array<Symbol>): Map<Symbol, DispatcherFunc> {
	var callbacks = new Map();
	syms.forEach((sym) => {
		if(dispatcher._callbacks.has(sym)) callbacks.set(sym, dispatcher._callbacks.get(sym));
	});
	return callbacks;
}

/*------------------------------------------------------------------------------------------------*/
//	--- Export ---
/*------------------------------------------------------------------------------------------------*/
module.exports.Dispatcher = Dispatcher;
module.exports.ServerDispatcher = ServerDispatcher;
module.exports.ClientDispatcher = ClientDispatcher;
