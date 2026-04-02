
const express = require("express");
const router = express.Router();
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} = require("../controllers/record.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.get("/", authenticate, authorize("viewer", "analyst", "admin"), getRecords);

router.get("/:id", authenticate, authorize("viewer", "analyst", "admin"), getRecord);

router.post("/", authenticate, authorize("analyst", "admin"), createRecord);

router.patch("/:id", authenticate, authorize("analyst", "admin"), updateRecord);

router.delete("/:id", authenticate, authorize("admin"), deleteRecord);

module.exports = router;