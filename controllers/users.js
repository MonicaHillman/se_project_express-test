const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");

const BadRequestError = require("../errors/bad-request-error");
const NotFoundError = require("../errors/not-found-error");
const ConflictError = require("../errors/conflict-error");

// GET /users/me
const getUserData = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => new NotFoundError("User ID not found"))
    .then((user) => res.send(user))
    .catch(next);
};

// POST /users
const createUser = (req, res, next) => {
  const { name, avatar, password, email } = req.body;

  if (!email || !password) {
    throw new BadRequestError("The 'email' and 'password' fields are required");
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError(
          "The user with the provided email already exists"
        );
      } else {
        return bcrypt.hash(password, 10);
      }
    })
    .then((hash) =>
      User.create({
        name,
        avatar,
        email,
        password: hash,
      })
    )
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(
          new BadRequestError(
            `${Object.values(err.errors)
              .map((error) => error.message)
              .join(", ")}`
          )
        );
      } else {
        next(err);
      }
    });
};

// POST /signin
const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      // Students can save jwt in the cookie, or send it in the body of the response.
      // Both options are ok
      res
        // .cookie('jwt', token, {
        //  // jwt token lives for a specific period (for example, 7 days),
        //  // and is not given indefinitely
        //   maxAge: 3600000,
        //   httpOnly: true,
        //   sameSite: true,
        // })
        .send({ token });
    })
    .catch(next);
};

// PATCH /users/me
const updateUserData = (req, res, next) => {
  // When updating a user or cards, `new: true` is passed to options.
  User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  })
    .orFail(() => new NotFoundError("User ID not found"))
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports = {
  createUser,
  login,
  getUserData,
  updateUserData,
};
