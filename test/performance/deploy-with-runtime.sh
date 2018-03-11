#!/bin/sh
mkdir -p .package
zip -r .package/test-lambda-function-with-runtime.zip test-lambda-function/node_modules test-lambda-function/index.js
aws lambda update-function-code --function-name TestLambdaFunctionWithRuntime --zip-file fileb://.package/test-lambda-function-with-runtime.zip --publish