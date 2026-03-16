const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const activityRoutes = require("./routes/activityRoutes");
const authRoutes = require("./routes/authRoutes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
