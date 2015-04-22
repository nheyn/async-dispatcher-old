type JsonObject<J: Json> = { [key: string]: J };
type JsonArray<J: Json> = Array<J>;
type JsonValue<T: string | number | bool> = T;
type Json = JsonObject | JsonArray | JsonValue;