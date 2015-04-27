/**
 * @flow
 */

/*------------------------------------------------------------------------------------------------*/
//	Data Source Class
/*------------------------------------------------------------------------------------------------*/
/**
 * A class used to lookup data.
 */
class DataSource<D: Dispatcher> {
	_dispatcher: D;

	constructor(dispatcher: D) {
		this._dispatcher = dispatcher;
	}

	/**
	 * Register a new lookup function.
	 *
	 * @param {LookupFunction}	lookupFunc	The callback to register
	 *
	 * @return {Symbol}						The symbol to use to unregister the callback
	 */
	register(lookupFunc: LookupFunction): Symbol {
		return this._dispatcher.register(lookupFunc);
	}

	/**
	 * Unregister a lookup function.
	 *
	 * @param {Symbol}	sym	The symbol returned by register for the callback to remove
	 *
	 * @return {bool}		TRUE if the symbol was removed, false if the given symbol is invalid
	 */
	unregister(sym: Symbol): bool {
		return this._dispatcher.unregister(sym);
	}

	/**
	 * Lookup data for the given query.
	 *
	 * @param {JsonObject}	query		The query to send to each of the resisted functions
	 *
	 * @return {Promise<JsonObject>}	A promise that contains an array of results from each
	 *									registered callback, that return something.
	 */
	lookup(query: JsonObject): Promise<JsonObject> {
		var merge = function(results: Array<JsonObject>): JsonObject {
			//return Object.assign({}, ...results); // Flow Error: Object.assign Expected object instead of, rest array of spread operand
			// Change to deep merge
			var mergedObj = {};
			for(var i = 0; i<results.length; i++) mergedObj = Object.assign(mergedObj, results[i]);
			return mergedObj;
		};
		return this._dispatcher.dispatch(query).then(merge);
	}
}

/**
 * A class used to lookup data, where some is on an external client.
 */
class NetworkDataSource extends DataSource<NetworkDispatcher> {
	constructor(dispatcher: NetworkDispatcher) {
		super(dispatcher);
	}

	/**
	 * Register a new lookup function that should only be called on the server.
	 *
	 * @param {LookupFunction}	lookupFunc	The callback to register
	 *
	 * @return {Symbol}						The symbol to use to unregister the callback
	 */
	registerForServer(callback: DispatcherFunc): Symbol {
		//TODO, figure out what is correct es6
		return this._dispatcher.registerForServer(callback);	//FOR BABEL
		//return super._dispatcher.registerForServer(callback);	//FOR FLOWTYPE
	}
}

/*------------------------------------------------------------------------------------------------*/
//	Exports
/*------------------------------------------------------------------------------------------------*/
module.exports.DataSource = DataSource;
module.exports.NetworkDataSource = NetworkDataSource;