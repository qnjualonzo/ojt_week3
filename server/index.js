const express = require("express");
const cors = require("cors");
const activityRoutes = require("./routes/activityRoutes");
const startScheduler = require("./utils/scheduler"); // 1. Import it
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);

// Routes
app.use("/api/activities", activityRoutes);

// 2. Start the background processes
startScheduler();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

