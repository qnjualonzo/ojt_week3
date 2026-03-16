const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const upload = require("../middlewares/upload"); 
const auth = require("../middlewares/authMiddleware"); 

// --- PROTECTED ROUTES ---
// All routes below require a valid JWT token via the 'auth' middleware.

// 1. Get Activity Statistics (For Data Visualization/Charts)
router.get("/stats", auth, activityController.getActivityStats);

// 2. View all tasks for the logged-in user
router.get("/", auth, activityController.getActivities);

// 3. Create a task (Requires File Upload)
router.post("/", auth, upload.single("file"), activityController.createActivity);

// 4. Update a task (Requires File Upload)
router.put("/:id", auth, upload.single("file"), activityController.updateActivity);

// 5. Delete a task
router.delete("/:id", auth, activityController.deleteActivity);

module.exports = router;