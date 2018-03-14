module.exports.returnEvent = async (event, context) => event;

module.exports.returnContext = async (event, context) => context;

module.exports.returnError = async (event, context) => {
  throw new Error('Test error');
};

module.exports.returnEventWithCallback = (event, context, callback) => callback(null, event);

module.exports.returnErrorWithCallback = (event, context, callback) => callback(new Error('Test error'));

module.exports.throwError = (event, context, callback) => {
  throw new Error('Test error');
};

module.exports.killSigTerm = (event, context, callback) =>
  process.kill(process.pid, 'SIGTERM');

module.exports.setCallbackWaitsForEmptyEventLoopToTrue = async (event, context) =>
  context.callbackWaitsForEmptyEventLoop = true;

module.exports.runOnServerlessLocal = (event, context, callback) => {
  console.log(process.version);
  callback(null, event);
};
