# Lambda Node Runtime

The module allows you to run your JavaScript code on any Node.js version in AWS Lambda.

## Quick start

### Installation
Add module to your AWS Lambda Node.js project:
```
npm install lambda-node-runtime -S
```

### Usage
Write a module that holds AWS Lambda handler:
```js
module.exports.handler = async (event, context) => {
    // Your code
}
```
Reference your handler using AWS Lambda Environment Variable
```
LAMBDA_NODE_HANDLER=index.handler
```
Set AWS Lambda Handler to expression
```
node_modules/lambda-node-runtime/index.handler
```

## How it works
When you install `lambda-node-runtime` module it downloads Node 8 in `node_modules` dir. Therefore, when you create an AWS Lambda package it includes Node 8. When AWS Lambda package is deployed and invoked bundled Node 8 child process starts and executes your JS code.

### Why is this possible?
It is possible to run Node version of your desire because Node binary is relatively small (around 10 MB when zipped) so there is plenty of space left for code (AWS Lambda package size restriction is 50 MB).

Also Node is fast to start so there is almost no latency after you invoke AWS Lambda function and when it actually starts running the code.
