const errors = require('./errors');

const resolveLambdaFunction = (callback) => {
    const [moduleName, functionName] = process.env.LAMBDA_NODE_HANDLER.split('.');
    let handlerModule = null;
    try {
        handlerModule = require(`${process.cwd()}/${moduleName}`);
    } catch (error) {
        return callback(new Error(errors.NO_HANDLER_MODULE(moduleName)));
    }
    const lambdaFunction = handlerModule[functionName];
    lambdaFunction
        ? callback(null, lambdaFunction)
        : callback(new Error(errors.NO_HANDLER_FUNCTION(functionName)));
};

const errorMessage = error => error ? error.message : null;

const handleResult = (error, result) =>
    process.send({ type: 'RESULT', content: { errorMessage: errorMessage(error), result } });

const handlePromise = result =>
    result instanceof Promise && result
        .then(result => handleResult(null, result))
        .catch(handleResult);

const handlerMethod = () => process.env.LAMBDA_NODE_HANDLER.split('.')[1];

const invokeHandler = (event, context) =>
    resolveLambdaFunction((error, lambdaFunction) =>
        error
            ? handleResult(error)
            : handlePromise(lambdaFunction(event, context, handleResult)));

process.on(
    'message',
    message => message.type === 'HANDLER_ARGS'
        ? invokeHandler(message.content.event, message.content.context)
        : console.error('IPC: invalid message', message)
);
