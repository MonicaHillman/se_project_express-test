const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? "An error has occurred on the server" : err.message;
  res.status(statusCode).send({ message });
  next();
};

module.exports = errorHandler;
