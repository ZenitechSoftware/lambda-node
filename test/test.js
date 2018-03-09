const { describe, describe: context, it } = require('mocha');
const { assert } = require('chai');

const lambdaNode = require('../index');
const errors = require('../src/errors');

describe('Lambda Node', () => {
  it('should set callbackWaitsForEmptyEventLoop to false', cb => {
    let context = {};
    delete process.env.LAMBDA_NODE_HANDLER;
    lambdaNode.handler(
      null,
      context,
      () => (assert.equal(context.callbackWaitsForEmptyEventLoop, false), cb())
    );
  });
  it('should fail in case LAMBDA_NODE_HANDLER is not provided', cb => {
    let context = {};
    delete process.env.LAMBDA_NODE_HANDLER;
    lambdaNode.handler(
      null,
      {},
      error => (assert.equal(error.message, errors.NO_LAMBDA_NODE_HANDLER_ENV_VAR), cb())
    );
  });
  it('should fail in case LAMBDA_NODE_HANDLER is invalid', cb => {
    process.env.LAMBDA_NODE_HANDLER = 'invalid value';
    lambdaNode.handler(
      null,
      {},
      error => (assert.equal(error.message, errors.INVALID_LAMBDA_NODE_HANDLER_ENV_VAR), cb())
    );
  });
  it('should fail in case lambda handler module is not found', cb => {
    process.env.LAMBDA_NODE_HANDLER = 'does/not/exist.handlerThatDoesNotExist';
    lambdaNode.handler(
      null,
      {},
      error => (assert.equal(error.message, errors.NO_HANDLER_MODULE('does/not/exist')), cb())
    );
  });
  it('should fail in case lambda handler module function is not found', cb => {
    process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.handlerThatDoesNotExist';
    lambdaNode.handler(
      null,
      {},
      error => (assert.equal(error.message, errors.NO_HANDLER_FUNCTION('handlerThatDoesNotExist')), cb())
    );
  });
  context('Lambda function return promise', () => {
    it('should respond with error', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnError';
      lambdaNode.handler(
        {},
        {},
        error => (assert.equal(error.message, 'Test error'), cb())
      );
    });
    it('should respond with request event', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnEvent';
      const event = { type: 'TEST' };
      lambdaNode.handler(
        event,
        {},
        (error, result) => (assert.deepEqual(result, event), cb())
      );
    });
  });
  context('Lambda function invokes callback', () => {
    it('should respond with error', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnErrorWithCallback';
      const event = { type: 'TEST' };
      lambdaNode.handler(
        {},
        {},
        error => (assert.equal(error.message, 'Test error'), cb())
      );
    });
    it('should respond with request event', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnEventWithCallback';
      const event = { type: 'TEST' };
      lambdaNode.handler(
        event,
        {},
        (error, result) => (assert.deepEqual(result, event), cb())
      );
    });
    it('should reuse existing child process and respond with request event', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnEventWithCallback';
      const event = { type: 'TEST' };
      lambdaNode.handler(
        event,
        {},
        (error, result) => (assert.deepEqual(result, event), cb())
      );
    });
    context('Lambda function throws uncaught', () => {
      it('should respond with error', cb => {
        process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.throwError';
        lambdaNode.handler(
          {},
          {},
          error => (assert.equal(error.message, 'Exit code 1'), cb())
        );
      });
    });
  });
  context('Lambda function kills itself with signal SIGTERM', () => {
    it('should respond with error', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.killSigTerm';
      lambdaNode.handler(
        {},
        {},
        error => (assert.equal(error.message, 'Exit signal SIGTERM'), cb())
      );
    });
  });
});
