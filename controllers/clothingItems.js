const ClothingItem = require("../models/clothingItem");
const BadRequestError = require("../errors/bad-request-error");
const NotFoundError = require("../errors/not-found-error");
const ForbiddenError = require("../errors/forbidden-error");

// GET /items
const getClothingItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch(next);
};

// POST /items
const createClothingItem = (req, res, next) => {
  const owner = req.user._id;
  const { name, imageUrl, weather } = req.body;
  ClothingItem.create({
    name,
    imageUrl,
    weather,
    owner,
  })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      // 400 — invalid data passed to the methods for creating a card/user or
      // updating a user's profile or avatar
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

// DELETE /items/:id
const deleteClothingItem = (req, res, next) => {
  const { id } = req.params;
  ClothingItem.findById(id)
    .orFail(() => new NotFoundError("Item ID not found"))
    .then((item) => {
      if (!item.owner.equals(req.user._id)) {
        next(new ForbiddenError("You cannot delete someone else's card"));
      } else {
        ClothingItem.deleteOne(item).then(() => res.send(item));
      }
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError(`Invalid id: '${id}'`));
      } else {
        next(err);
      }
    });
};

const updateLike = (req, res, next, method) => {
  const {
    params: { id },
  } = req;

  // When updating a user or items, `new: true` is passed to options.
  ClothingItem.findByIdAndUpdate(
    id,
    { [method]: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => new NotFoundError("Item ID not found"))
    .then((item) => {
      res.send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError(`Invalid id: '${id}'`));
      } else {
        next(err);
      }
    });
};

// PUT /items/:id/likes
const likeClothingItem = (req, res, next) =>
  updateLike(req, res, next, "$addToSet");

// DELETE /items/:id/likes
const dislikeClothingItem = (req, res, next) =>
  updateLike(req, res, next, "$pull");

module.exports = {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
};
