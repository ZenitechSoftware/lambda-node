const { spawn, fork } = require('child_process');

const errors = require('./errors');

class CloseError extends Error {
  constructor(message) {
    super(message);
  }
};

let nodeChildProcess = null;
let nodeHandlerExpression = null;

const createError = errorMessage => errorMessage ? new Error(errorMessage) : null;

const returnResult = (nodeChildProcess, errorMessage, result, callback) =>
  callback(createError(errorMessage), result);

const handleMessage = (nodeChildProcess, message, context, callback) =>
  message.type === 'RESULT'
    ? returnResult(nodeChildProcess, message.content.errorMessage, message.content.result, callback)
    : message.type === 'IS_CALLBACK_WAITS_FOR_EMPTY_EVENT_LOOP'
      ? context.callbackWaitsForEmptyEventLoop = message.content
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
  },
  remainingTimestamp: context.getRemainingTimeInMillis() + new Date().getTime(),
});

const buildCloseError = (code, signal) =>
  code ? new CloseError(`Exit code ${code}`) : new CloseError(`Exit signal ${signal}`);

const handleNodeChildProcess = (nodeChildProcess, event, context, callback) =>
  nodeChildProcess
    .on('close', (code, signal) => callback(buildCloseError(code, signal)))
    .on('error', callback)
    .on('message', message => handleMessage(nodeChildProcess, message, context, callback));

const getNodeChildProcess = (event, context, callback) => {
  if (nodeChildProcess) {
    if (process.env.LAMBDA_NODE_HANDLER === nodeHandlerExpression) {
      return handleNodeChildProcess(nodeChildProcess, event, context, callback);
    }
    nodeChildProcess.disconnect();
  }
  nodeChildProcess = handleNodeChildProcess(
    process.env.IS_LOCAL
      ? fork(
        `${__dirname}/lambdaFunctionInvoker`,
        [],
        { stdio: [process.stdin, process.stdout, process.stderr, 'ipc'] }
      )
      : spawn(
        `${__dirname}/../.node/bin/node`,
        [`${__dirname}/lambdaFunctionInvoker`],
        { stdio: [process.stdin, process.stdout, process.stderr, 'ipc'] }
      ),
    event,
    context,
    callback
  );
  return nodeChildProcess;
};

const runtimeCallback = (callback, context) => (error, result) => {
  if (error instanceof CloseError) {
    nodeChildProcess = null;
  } else if (context.callbackWaitsForEmptyEventLoop || process.env.IS_LOCAL) {
    nodeChildProcess.disconnect();
    nodeChildProcess = null;
  } else {
    nodeChildProcess.removeAllListeners();
  }
  nodeHandlerExpression = process.env.LAMBDA_NODE_HANDLER;
  callback(error, result);
};

module.exports = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  !process.env.LAMBDA_NODE_HANDLER
    ? callback(new Error(errors.NO_LAMBDA_NODE_HANDLER_ENV_VAR))
    : !/.+\..+/.test(process.env.LAMBDA_NODE_HANDLER)
      ? callback(new Error(errors.INVALID_LAMBDA_NODE_HANDLER_ENV_VAR))
      : getNodeChildProcess(event, context, runtimeCallback(callback, context)).send(
        { type: 'HANDLER_ARGS', content: handlerArguments(event, context) }
      );
};
