const superagent = require("superagent");

module.exports.successResponse = function (result, msg) {
  return {
    error: false,
    response: result,
    message: msg,
  };
};

module.exports.successMsg = function (result) {
  return {
    error: false,
    message: result,
  };
};

module.exports.failResponse = function (result) {
  return {
    error: true,
    response: result,
  };
};

module.exports.failMsg = function (result) {
  return {
    error: true,
    message: result,
  };
};
