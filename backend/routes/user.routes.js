
const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
router.get("/", authenticate, authorize("admin"), getUsers);
router.get("/:id", authenticate, authorize("admin"), getUser);
router.post("/", authenticate, authorize("admin"), createUser);
router.patch("/:id/role", authenticate, authorize("admin"), updateUserRole);
router.patch("/:id/status", authenticate, authorize("admin"), updateUserStatus);
router.delete("/:id", authenticate, authorize("admin"), deleteUser);

module.exports = router;