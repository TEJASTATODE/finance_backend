
const express = require("express");
const router = express.Router();
const {
  getSummary,
  getCategoryWise,
  getRecentActivity,
  getTrends,
} = require("../controllers/dashboard.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.get("/summary", authenticate, authorize("analyst", "admin"), getSummary);
router.get("/category", authenticate, authorize("analyst", "admin"), getCategoryWise);

router.get("/recent", authenticate, authorize("analyst", "admin"), getRecentActivity);

router.get("/trends", authenticate, authorize("analyst", "admin"), getTrends);

module.exports = router;