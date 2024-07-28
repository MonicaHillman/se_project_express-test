const router = require("express").Router();
const {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
} = require("../controllers/clothingItems");
const auth = require("../middlewares/auth");
const {
  validateId,
  validateClothingItem,
} = require("../middlewares/validations");

router.get("/", getClothingItems);

router.use(auth);
router.post("/", validateClothingItem, createClothingItem);
router.delete("/:id", validateId, deleteClothingItem);
router.put("/:id/likes", validateId, likeClothingItem);
router.delete("/:id/likes", validateId, dislikeClothingItem);

module.exports = router;
