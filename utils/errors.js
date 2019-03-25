exports.handle500Error = (err, next) => {
  console.log(err);
  const error = new Error(err);
  error.httpStatusCode = 500;
  // NOTE: Call next with an argument => Inform Express that an error occured and it will skip all the middleware and move away to error handling middleware
  return next(error);
};
