module.exports.returnEvent = async (event, context) => event;

module.exports.returnError = async (event, context) => {
  throw new Error('Test error');
};

module.exports.returnEventWithCallback = (event, context, callback) => callback(null, event);

module.exports.returnErrorWithCallback = (event, context, callback) => callback(new Error('Test error'));

module.exports.throwError = (event, context, callback) => {
  throw new Error('Test error');
};

module.exports.killSigTerm = (event, context, callback) => {
  process.kill(process.pid, 'SIGTERM');
};
