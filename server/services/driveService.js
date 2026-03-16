const { drive } = require("../config/googleConfig");
const stream = require("stream");

exports.uploadToDrive = async (fileObject) => {
  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);

    const { data } = await drive.files.create({
      requestBody: {
        name: `${Date.now()}_${fileObject.originalname}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: { mimeType: fileObject.mimetype, body: bufferStream },
      fields: "id, webViewLink",
    });

    await drive.permissions.create({
      fileId: data.id,
      requestBody: { role: "reader", type: "anyone" },
    });

    return data.webViewLink;
  } catch (error) {
    console.error("Google Drive upload failed:", error.message);
    return null; // Activity is still saved, just without a file link
  }
};
