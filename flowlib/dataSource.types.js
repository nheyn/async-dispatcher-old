type LookupFunction = (query: JsonObject) => Promise<JsonObject> | JsonObject;

declare class DataSource {
	register(lookupFunc: LookupFunction): Symbol;
	unregister(sym: Symbol): bool;
	lookup(payload: JsonObject): Promise<JsonObject>;
}

declare class NetworkDataSource extends DataSource {
	registerForServer(callback: LookupFunction): Symbol;
}