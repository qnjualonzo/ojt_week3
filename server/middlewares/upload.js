const multer = require("multer");

// We use memoryStorage because we don't need to save the file locally.
// We just need the buffer to send it to Google Drive.
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

module.exports = upload;