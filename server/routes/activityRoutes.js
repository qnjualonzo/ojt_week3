const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const upload = require("../middlewares/upload");
const auth = require("../middlewares/authMiddleware");
const { createRules, updateRules, deleteRules, validate } = require("../validators/activityValidator");

router.get("/stats", auth, activityController.getActivityStats);
router.get("/", auth, activityController.getActivities);
router.post("/", auth, upload.single("file"), createRules, validate, activityController.createActivity);
router.put("/:id", auth, upload.single("file"), updateRules, validate, activityController.updateActivity);
router.delete("/:id", auth, deleteRules, validate, activityController.deleteActivity);

module.exports = router;