var _ = require('lodash');

var httpError = module.exports.http = function (code, message, data, stack) {
  if(!code) throw new Error('error code is required'); 

  var err = new Error(message);
  err.code = code;
  err.message = message;
  err.data = data;
  err.stack = stack;

  return err;
};

module.exports.toHttp = function (err) {
  if(err.name == 'ValidationError') 
    return formatValidationError(err); 
};


function formatValidationError (err) {
  var reasons = [];
  _.forOwn(err.errors, (val, key) => {
    reasons.push(val.message); 
  });
  return httpError(400, err.message, reasons);
}

