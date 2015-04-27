/**
 * @flow
 */
var dispatcher = require('./dispatcher.js');
var dataSource = require('./dataSource.js');

/**
 * Create a basic Dispatcher.
 *
 * @return	The new dispatcher
 */
function createDispatcher(): Dispatcher {
	return new dispatcher.Dispatcher();
}

/**
 * Create a Network Dispatcher that will run on the server.
 *
 * @param encode	{DispatcherEncodeFunc}	The functions used to encode results into a single json
 *											object that is send to the client
 *
 * @return									The new server dispatcher
 */
function createServerDispatcher(encode: DispatcherEncodeFunc): NetworkDispatcher {
	return new dispatcher.ServerDispatcher({
		dispatcher: createDispatcher(),
		encode: encode
	});
}

/**
 * Create a Network Dispatcher that will run on the client.
 *
 * @param sendData	{DispatcherSendDataFunc}	
 * @param decode	{DispatcherDecodeFunc}		The functions used to decode results of the json
 *												object returned from the server
 *
 * @return										The new client dispatcher
 */
function createClientDispatcher(
		sendData:	DispatcherSendDataFunc, 
		decode:		DispatcherDecodeFunc
):					NetworkDispatcher 		{
	return new dispatcher.ClientDispatcher({
		dispatcher: createDispatcher(),
		sendData: sendData,
		decode: decode
	});
}

/**
 * Create a basic Data Source.
 *
 * @return	The new Data Source
 */
function createDataSource<D>(): DataSource<D> {
	return new dataSource.DataSource({
		dispatcher: createDispatcher()
	});
}

/**
 * Create a Network Data Source that will run on the server.
 *
 * @param encode	{DispatcherEncodeFunc}	The functions used to encode results into a single json
 *											object that is send to the client
 *
 * @return									The new server data source
 */
function createServerDataSource(encode: DispatcherEncodeFunc): NetworkDataSource {
	return new dataSource.NetworkDataSource({
		dataSource: createServerDispatcher(encode)
	})
}

/**
 * Create a Network Data Source that will run on the client.
 *
 * @param sendData	{DispatcherSendDataFunc}	
 * @param decode	{DispatcherDecodeFunc}		The functions used to decode results of the json
 *												object returned from the server
 *
 * @return										The new client Data Source
 */
function createClientDataSource(
		sendData:	DispatcherSendDataFunc, 
		decode:		DispatcherDecodeFunc
):					NetworkDataSource {
	return new dataSource.NetworkDataSource({
		dataSource: createClientDispatcher(sendData, decode)
	});
}

/*------------------------------------------------------------------------------------------------*/
//	Exports
/*------------------------------------------------------------------------------------------------*/
module.exports.createDispatcher = createDispatcher;
module.exports.createServerDispatcher = createServerDispatcher;
module.exports.createClientDispatcher = createClientDispatcher;
module.exports.createDataSource = createDataSource;
module.exports.createServerDataSource = createServerDataSource;
module.exports.createClientDataSource = createClientDataSource;