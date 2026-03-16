require("dotenv").config();

const requiredVars = [
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "GOOGLE_DRIVE_FOLDER_ID",
  "EMAIL_USER",
  "EMAIL_APP_PASSWORD",
  "ADMIN_EMAIL",
];

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}

module.exports = process.env;
