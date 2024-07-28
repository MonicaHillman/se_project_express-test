const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UNAUTHORIZED_ERROR_CODE } = require("../utils/errors");

// There is a `middlewares/auth.js` file containing a middleware function for checking JWT.
const auth = (req, res, next) => {
  // const token = req.cookies.jwt;
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    const error = new Error("Authorization required");
    error.statusCode = UNAUTHORIZED_ERROR_CODE;
    return next(error);
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const error = new Error("Authorization required");
    error.statusCode = UNAUTHORIZED_ERROR_CODE;
    return next(error);
  }

  req.user = payload; // assigning the payload to the request object

  return next(); // sending the request to the next middleware
};

module.exports = auth;
