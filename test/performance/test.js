const { assert } = require('chai');
const aws = require('aws-sdk');

describe('Lambda Node Runtime Performance', () => {
  const lambda = new aws.Lambda({ region: 'eu-west-2' });
  context('Without Bundled Runtime', () => {
    it('should calculate duration for 10 runs', cb => {
      let i = 0;
      const interval = setInterval(
        () => {
          let start = new Date().getTime();
          lambda.invoke({
            FunctionName: 'TestLambdaFunctionWithoutRuntime',
            InvocationType: 'RequestResponse',
            LogType: 'None',
            Payload: Buffer.from(JSON.stringify({ testKey: 'Test Value' }), 'utf-8'),
          }, (error) => {
            if (error) {
              cb(error);
              return;
            }
            console.log('Duration', new Date().getTime() - start);
            if (i++ === 10) {
              clearInterval(interval);
              cb();
            }
          });
        },
        1000
      );
    }).timeout(15000);
  });
  context('With Bundled Runtime', () => {
    it('should calculate duration for 10 runs', cb => {
      let i = 0;
      const interval = setInterval(
        () => {
          let start = new Date().getTime();
          lambda.invoke({
            FunctionName: 'TestLambdaFunctionWithRuntime',
            InvocationType: 'RequestResponse',
            LogType: 'None',
            Payload: Buffer.from(JSON.stringify({ testKey: 'Test Value' }), 'utf-8'),
          }, (error) => {
            if (error) {
              cb(error);
              return;
            }
            console.log('Duration', new Date().getTime() - start);
            if (i++ === 10) {
              clearInterval(interval);
              cb();
            }
          });
        },
        1000
      );
    }).timeout(15000);
  });
});
