#!/bin/sh
mkdir -p .package
zip -r .package/test-lambda-function-without-runtime.zip test-lambda-function/index.js
aws lambda update-function-code --function-name TestLambdaFunctionWithoutRuntime --zip-file fileb://.package/test-lambda-function-without-runtime.zip --publish