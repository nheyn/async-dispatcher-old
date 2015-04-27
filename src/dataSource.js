/**
 * @flow
 */

/*------------------------------------------------------------------------------------------------*/
//	--- Data Source Class ---
/*------------------------------------------------------------------------------------------------*/
type DataSourceSettings<D: Dispatcher> = {
	dispatcher: D;
};

/**
 * A class used to lookup data.
 */
function DataSource<D: Dispatcher>(settings: DataSourceSettings<D>) {
	this._dispatcher = settings.dispatcher;
}

/*------------------------------------------------------------------------------------------------*/
//	Data Source Methods
/*------------------------------------------------------------------------------------------------*/
/**
 * Register a new lookup function.
 *
 * @param {LookupFunction}	lookupFunc	The callback to register
 *
 * @return {Symbol}						The symbol to use to unregister the callback
 */
DataSource.prototype.register = function(lookupFunc: LookupFunction): Symbol {
	return this._dispatcher.register(lookupFunc);
};

/**
 * Unregister a lookup function.
 *
 * @param {Symbol}	sym	The symbol returned by register for the callback to remove
 *
 * @return {bool}		TRUE if the symbol was removed, false if the given symbol is invalid
 */
DataSource.prototype.unregister = function(sym: Symbol): bool {
	return this._dispatcher.unregister(sym);
};

/**
 * Lookup data for the given query.
 *
 * @param {JsonObject}	query		The query to send to each of the resisted functions
 *
 * @return {Promise<JsonObject>}	A promise that contains an array of results from each
 *									registered callback, that return something.
 */
DataSource.prototype.lookup = function(query: JsonObject): Promise<JsonObject> {
	var merge = function(results: Array<JsonObject>): JsonObject {
		//return Object.assign({}, ...results); // Flow Error: Object.assign Expected object instead of, rest array of spread operand
		// Change to deep merge
		var mergedObj = {};
		for(var i = 0; i<results.length; i++) mergedObj = Object.assign(mergedObj, results[i]);
		return mergedObj;
	};
	return this._dispatcher.dispatch(query).then(merge);
};

DataSource.prototype.getDispatcher = function<D: Dispatcher>(): D {
	return this._dispatcher;
};

/*------------------------------------------------------------------------------------------------*/
//	--- Network Data Source Class ---
/*------------------------------------------------------------------------------------------------*/
type NetworkDataSourceSettings = {
	dataSource: DataSource<NetworkDispatcher>;
};

/**
 * A class used to lookup data.
 */
function NetworkDataSource(settings: NetworkDataSourceSettings) {
	this._dataSource = settings.dataSource;
}

/*------------------------------------------------------------------------------------------------*/
//	Network Data Source Class Proxy Methods of Data Source Methods
/*------------------------------------------------------------------------------------------------*/
NetworkDataSource.prototype.register = function(lookupFunc: LookupFunction): Symbol {
	return this._dataSource.register(lookupFunc);
};

NetworkDataSource.prototype.unregister = function(sym: Symbol): bool {
	return this._dataSource.unregister(sym);
};

NetworkDataSource.prototype.lookup = function(query: JsonObject): Promise<JsonObject> {
	return this._dataSource.lookup(query);
};

/*------------------------------------------------------------------------------------------------*/
//	Network Data Source Methods
/*------------------------------------------------------------------------------------------------*/
/**
 * Register a new lookup function that should only be called on the server.
 *
 * @param {LookupFunction}	lookupFunc	The callback to register
 *
 * @return {Symbol}						The symbol to use to unregister the callback
 */
NetworkDataSource.prototype.registerForServer = function(callback: DispatcherFunc): Symbol {
	var dispatcher = this._dataSource.getDispatcher();
	return dispatcher.registerForServer(callback);
};


/*------------------------------------------------------------------------------------------------*/
//	Exports
/*------------------------------------------------------------------------------------------------*/
module.exports.DataSource = DataSource;
module.exports.NetworkDataSource = NetworkDataSource;