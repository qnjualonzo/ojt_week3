const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const upload = require("../middlewares/upload"); // Use the middleware we just fixed

// No need to define 'const upload = multer(...)' here anymore!

router.post("/", upload.single("file"), activityController.createActivity);
router.get("/", activityController.getActivities);
router.put("/:id", upload.single("file"), activityController.updateActivity);
router.delete("/:id", activityController.deleteActivity);

module.exports = router;