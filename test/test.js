const { describe, describe: context, it } = require('mocha');
const { assert } = require('chai');

const lambdaNode = require('../index');
const errors = require('../src/errors');

describe('Lambda Node Runtime', () => {
  it('should set callbackWaitsForEmptyEventLoop to false', cb => {
    let context = { getRemainingTimeInMillis: () => 6000 };
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
      { getRemainingTimeInMillis: () => 6000 },
      error => (assert.equal(error.message, errors.NO_LAMBDA_NODE_HANDLER_ENV_VAR), cb())
    );
  });
  it('should fail in case LAMBDA_NODE_HANDLER is invalid', cb => {
    process.env.LAMBDA_NODE_HANDLER = 'invalid value';
    lambdaNode.handler(
      null,
      { getRemainingTimeInMillis: () => 6000 },
      error => (assert.equal(error.message, errors.INVALID_LAMBDA_NODE_HANDLER_ENV_VAR), cb())
    );
  });
  it('should fail in case lambda handler module is not found', cb => {
    process.env.LAMBDA_NODE_HANDLER = 'does/not/exist.handlerThatDoesNotExist';
    lambdaNode.handler(
      null,
      { getRemainingTimeInMillis: () => 6000 },
      error => (assert.equal(error.message, errors.NO_HANDLER_MODULE('does/not/exist')), cb())
    );
  });
  it('should fail in case lambda handler module function is not found', cb => {
    process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.handlerThatDoesNotExist';
    lambdaNode.handler(
      null,
      { getRemainingTimeInMillis: () => 6000 },
      error => (assert.equal(error.message, errors.NO_HANDLER_FUNCTION('handlerThatDoesNotExist')), cb())
    );
  });
  context('Lambda function return promise', () => {
    it('should respond with error', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnError';
      lambdaNode.handler(
        {},
        { getRemainingTimeInMillis: () => 6000 },
        error => (assert.equal(error.message, 'Test error'), cb())
      );
    });
    it('should respond with request event', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnEvent';
      const event = { type: 'TEST' };
      lambdaNode.handler(
        event,
        { getRemainingTimeInMillis: () => 6000 },
        (error, result) => (assert.deepEqual(result, event), cb())
      );
    });
    it('should respond with request context', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnContext';
      const context = {
        functionName: 'TestFunction',
        functionVersion: '1.0.0',
        invokedFunctionArn: 'arn://test',
        memoryLimitInMB: 1024,
        awsRequestId: 'test-request-id',
        logGroupName: 'logs/test',
        logStreamName: 'stream/test',
        identity: 123,
        clientContext: {
          env: {
            make: 'Apple'
          }
        },
      };
      lambdaNode.handler(
        null,
        { ...context, getRemainingTimeInMillis: () => 6000 },
        (error, result) => (assert.deepEqual(result, context), cb())
      );
    });
  });
  context('Lambda function invokes callback', () => {
    it('should respond with error', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnErrorWithCallback';
      const event = { type: 'TEST' };
      lambdaNode.handler(
        {},
        { getRemainingTimeInMillis: () => 6000 },
        error => (assert.equal(error.message, 'Test error'), cb())
      );
    });
    it('should respond with request event', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnEventWithCallback';
      const event = { type: 'TEST' };
      lambdaNode.handler(
        event,
        { getRemainingTimeInMillis: () => 6000 },
        (error, result) => (assert.deepEqual(result, event), cb())
      );
    });
    it('should reuse existing child process and respond with request event', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnEventWithCallback';
      const event = { type: 'TEST' };
      lambdaNode.handler(
        event,
        { getRemainingTimeInMillis: () => 6000 },
        (error, result) => (assert.deepEqual(result, event), cb())
      );
    });
    context('Lambda function throws uncaught', () => {
      it('should respond with error', cb => {
        process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.throwError';
        lambdaNode.handler(
          {},
          { getRemainingTimeInMillis: () => 6000 },
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
        { getRemainingTimeInMillis: () => 6000 },
        error => (assert.equal(error.message, 'Exit signal SIGTERM'), cb())
      );
    });
  });
  context('Lambda function runs on serverless local environment', () => {
    it('should respond with request event', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.runOnServerlessLocal';
      process.env.IS_LOCAL = true;
      const event = { type: 'TEST' };
      lambdaNode.handler(
        event,
        { getRemainingTimeInMillis: () => 6000 },
        (error, result) => (assert.deepEqual(result, event), cb())
      );
    });
  });
  context('context.getRemainingTimeInMillis function is used', () => {
    it('should respond with remainingTimeInMillis', cb => {
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.returnRemainingTimeInMillis';
      lambdaNode.handler(
        {},
        { getRemainingTimeInMillis: () => 6000 },
        (error, result) => (assert.approximately(result, 2500, 500), cb())
      );
    }).timeout(4000);
  });
  context('Lambda function sets callbackWaitsForEmptyEventLoop to true', () => {
    it('should complete function', cb => {
      let context = { getRemainingTimeInMillis: () => 6000 };
      process.env.LAMBDA_NODE_HANDLER = 'test/lambdaFunctions.setCallbackWaitsForEmptyEventLoopToTrue';
      lambdaNode.handler(
        null,
        context,
        () => (assert.equal(context.callbackWaitsForEmptyEventLoop, true), cb())
      );
    });
  });
});
