/**
 * @flow
 */

/*------------------------------------------------------------------------------------------------*/
//	--- Data Source Class ---
/*------------------------------------------------------------------------------------------------*/
type DataSourceSettings = {
	dispatcher: Dispatcher;
};

/**
 * A class used to lookup data.
 */
function DataSource(settings: DataSourceSettings) {
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
	return this._dispatcher.dispatch(query).then(mergeJson);
};

/*------------------------------------------------------------------------------------------------*/
//	--- Network Data Source Class ---
/*------------------------------------------------------------------------------------------------*/
type NetworkDataSourceSettings = {
	dataSource: DataSource;
};

/**
 * A class used to lookup data.
 */
function NetworkDataSource(settings: NetworkDataSourceSettings) {
	this._dataSource = settings.dataSource;
	this._dispatcher = this._dataSource._dispatcher;
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
 * NOTE: Falls back to regular register if 'registerForServer' is not in the dispatcher
 *
 * @param {LookupFunction}	lookupFunc	The callback to register
 *
 * @return {Symbol}						The symbol to use to unregister the callback
 */
NetworkDataSource.prototype.registerForServer = function(callback: DispatcherFunc): Symbol {
	return this._dispatcher.registerForServer?
				this._dispatcher.registerForServer(callback):
				this._dispatcher.register(callback);
};

/**
 * Lookup data on the server for the given query.
 *
 * NOTE: Falls back to regular lookup if 'dispatchForSeverRequest' is not in the dispatcher
 *
 * @param {JsonObject}	query		The query to send to each of the resisted functions
 *
 * @return {Promise<JsonObject>}	A promise that contains an array of results from each
 *									registered callback, that return something.
 */
NetworkDataSource.prototype.lookupForServerRequest = function(query:	JsonObject)
																	:	Promise<JsonObject> {
	return this._dispatcher.dispatchForSeverRequest?
			this._dispatcher.dispatchForSeverRequest(query):
			this.lookup(query);
};

/*------------------------------------------------------------------------------------------------*/
//	Helper Function
/*------------------------------------------------------------------------------------------------*/
function mergeJson(jsonObjects: Array<JsonObject>): JsonObject {
	//TODO, change to deep merge
	var mergedObj = {};
	for(var i = 0; i<jsonObjects.length; i++) mergedObj = Object.assign(mergedObj, jsonObjects[i]);
	return mergedObj;
}

/*------------------------------------------------------------------------------------------------*/
//	Exports
/*------------------------------------------------------------------------------------------------*/
module.exports.DataSource = DataSource;
module.exports.NetworkDataSource = NetworkDataSource;