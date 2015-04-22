type DispatcherPayload = JsonObject;
type DispatcherResponse = JsonObject;
type DispatcherFunc = (payload: DispatcherPayload) => ?MaybePromise<DispatcherResponse>;
type DispatcherSendDataFunc = (payload: DispatcherPayload) => MaybePromise<DispatcherResponse>;
type DispatcherDecodeFunc = (result: DispatcherResponse) => MaybePromise<DispatcherResponse>;
type DispatcherEncodeFunc = (results: Array<DispatcherPayload>) => MaybePromise<DispatcherResponse>;

declare class Dispatcher {
	register(callback: DispatcherFunc): Symbol;
	unregister(sym: Symbol): bool;
	dispatch(payload: DispatcherPayload): Promise<Array<DispatcherResponse>>;
}

declare class NetworkDispatcher extends Dispatcher {
	registerForServer(callback: DispatcherFunc): Symbol;
}

declare class SeverDispatcher extends NetworkDispatcher {
	dispatchForSeverRequest(payload: DispatcherPayload): Promise<DispatcherResponse>;
}