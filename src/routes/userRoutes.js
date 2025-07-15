const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { protect, authorize } = require("../middlewares/auth");

// Make sure all these controller references are functions
router.route("/").get(getUsers).post(createUser);

router
  .route("/:id")
  .get(getUser)
  .put(protect, authorize("admin"), updateUser)
  .delete(protect, authorize("admin"), deleteUser);

module.exports = router;
