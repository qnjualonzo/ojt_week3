require("./config/env"); // Validate env vars first (fail-fast)

const app = require("./app");
const startScheduler = require("./utils/scheduler");

startScheduler();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

