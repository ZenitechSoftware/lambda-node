const { spawn } = require('child_process');

const errors = require('./errors');

const createError = errorMessage => errorMessage ? new Error(errorMessage) : null;

const returnResult = (nodeChildProcess, errorMessage, result, callback) => (
    callback(createError(errorMessage), result), nodeChildProcess.disconnect()
);

const handleMessage = (nodeChildProcess, message, callback) =>
    message.type === 'RESULT'
        ? returnResult(nodeChildProcess, message.content.errorMessage, message.content.result, callback)
        : console.error('IPC: invalid message', message)

const handlerArguments = (event, context) => ({
    event,
    context: {
        functionName: context.functionName,
        functionVersion: context.functionVersion,
        invokedFunctionArn: context.invokedFunctionArn,
        memoryLimitInMB: context.memoryLimitInMB,
        awsRequestId: context.awsRequestId,
        logGroupName: context.logGroupName,
        logStreamName: context.logStreamName,
        identity: context.identity,
        clientContext: context.clientContext,
    }
});

const buildCloseError = (code, signal) =>
    code ? new Error(`Exit code ${code}`) : new Error(`Exit signal ${signal}`);

const handleNodeChildProcess = (nodeChildProcess, event, context, callback) =>
    nodeChildProcess
        .on('close', (code, signal) => callback(buildCloseError(code, signal)))
        .on('error', callback)
        .on('message', message => handleMessage(nodeChildProcess, message, callback))
        .send({ type: 'HANDLER_ARGS', content: handlerArguments(event, context) });

module.exports = (event, context, callback) =>
    !process.env.LAMBDA_NODE_HANDLER
        ? callback(new Error(errors.NO_LAMBDA_NODE_HANDLER_ENV_VAR))
        : !/.+\..+/.test(process.env.LAMBDA_NODE_HANDLER)
            ? callback(new Error(errors.INVALID_LAMBDA_NODE_HANDLER_ENV_VAR))
            : handleNodeChildProcess(
                spawn(
                    './.node/bin/node',
                    ['src/lambdaFunctionInvoker'],
                    { stdio: [process.stdin, process.stdout, process.stderr, 'ipc'] }
                ),
                event,
                context,
                callback
            );