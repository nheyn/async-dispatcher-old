**NOTE**
*This project is no longer supported, see the new [async-dispatcher](https://github.com/nheyn/async-dispatcher) for the similar features*

# Async Dispatcher
*A flux style Dispatcher that uses ES6 Promises*

Dispatcher for flux style data flow, see https://github.com/facebook/flux, that use ES6 Promises for timing and returning data.

### Features
* Dispatcher that takes a json object as payload and can return a json object inside of a Promise as a result.
* A Data Source, which is uses a Dispatcher to register callbacks that look up data.
* Client/Server version of Dispatcher and Data Source. Allows a *dispatcher.dispatch()* or *dataSource.lookup()* method that is called on a client to also be called on the server.

### Usage
##### Dispatcher
TODO
##### Data Source
TODO

### Tests
Test are run in the Docker container, create using

\`\`\`
docker build -t dispatcher-test .
docker run -it --rm dispatcher-test
\`\`\`

TODO: Finish writing tests

### Documentation
TODO: Get documentation from code

### Plans
* Write usage
* Get documentation from code
* Finish writing tests
* Add *onUpdate(callback)* register in data source
* Add *waitFor()* methods to handle timing / computing derived data from other callback in the dispatcher or data source
