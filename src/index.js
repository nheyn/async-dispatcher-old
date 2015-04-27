/**
 * @flow
 */
var dispatcher = require('./dispatcher.js');
var dataSource = require('./dataSource.js');

/**
 * //TODO
 */
function createDispatcher(): Dispatcher {
	return new dispatcher.Dispatcher();
}

/**
 * //TODO
 */
function createServerDispatcher(encode: DispatcherEncodeFunc): NetworkDispatcher {
	return new dispatcher.ServerDispatcher({
		dispatcher: createDispatcher(),
		encode: encode
	});
}

/**
 * //TODO
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
 * //TODO
 */
function createDataSource<D>(): DataSource<D> {
	return new dataSource.DataSource({
		dispatcher: createDispatcher()
	});
}

/**
 * //TODO
 */
function createServerDataSource(encode: DispatcherEncodeFunc): NetworkDataSource {
	return new dataSource.NetworkDataSource({
		dataSource: createServerDispatcher(encode)
	})
}

/**
 * //TODO
 */
function createClientDataSource(
		sendData:	DispatcherSendDataFunc, 
		decode:		DispatcherDecodeFunc
):					NetworkDataSource {
	return new dataSource.NetworkDataSource({
		dataSource: createClientDispatcher(sendData, encode)
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