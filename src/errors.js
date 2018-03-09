module.exports = {
  NO_LAMBDA_NODE_HANDLER_ENV_VAR: 'LAMBDA_NODE_HANDLER environment variable is not set',
  INVALID_LAMBDA_NODE_HANDLER_ENV_VAR: 'LAMBDA_NODE_HANDLER environment variable is not valid. Should have format: <PATH>.<FUNCTION>',
  NO_HANDLER_MODULE: module => `Handler module provided in LAMBDA_NODE_HANDLER environment variable is not found: ${module}`,
  NO_HANDLER_FUNCTION: func => `Handler module function provided in LAMBDA_NODE_HANDLER environment variable is not found: ${func}`,
};
