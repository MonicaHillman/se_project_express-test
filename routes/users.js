const router = require("express").Router();
const { getUserData, updateUserData } = require("../controllers/users");

router.get("/me", getUserData);
router.patch("/me", updateUserData);

module.exports = router;
