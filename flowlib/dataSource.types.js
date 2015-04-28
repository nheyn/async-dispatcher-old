type LookupQuery = JsonObject;
type LookupResponse = JsonObject;
type LookupFunction = (query: LookupQuery) => ?MaybePromise<LookupResponse>;

declare class DataSource {
	register(lookupFunc: LookupFunction): Symbol;
	unregister(sym: Symbol): bool;
	lookup(payload: LookupQuery): Promise<LookupResponse>;
}

declare class NetworkDataSource extends DataSource {
	registerForServer(callback: LookupFunction): Symbol;
}