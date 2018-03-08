# Lambda Node Runtime

The module allows you to run your JavaScript code on any Node.js version in AWS Lambda.

AWS Lambda rarely updates Node.js version, in fact AWS Lambda Node.js version problem looks  similar to one Babel tries to solve for JS versions. This module enables you to use latest Node.js version with latest features and bug/security fixes.

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
When you install `lambda-node-runtime` module it downloads Node (currently version 8.10.0) in `node_modules` dir. Therefore, when you create an AWS Lambda package it includes desired Node runtime. When AWS Lambda package is deployed and invoked, bundled Node child process starts and executes your JS code.

### Why is this possible?
It is possible to run Node version of your desire because Node binary is relatively small (around 10 MB when zipped) so there is plenty of space left for code (AWS Lambda package size restriction is 50 MB).

Also Node is fast to start so the latency between when you invoke AWS Lambda function and when it actually starts running the code is lower. Please note that latency is still there because new child process must be started. More details (comparisons, benchmarks) will be provided after the module is used for a number of projects.
