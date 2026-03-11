const nodemailer = require('nodemailer');
require('dotenv').config(); // CRITICAL: Ensures variables are loaded for this file

// Defensive Check: Log an error if variables are missing on startup
if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error("❌ EMAIL SERVICE ERROR: Missing credentials in .env file!");
}

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, 
  },
});

exports.sendEmail = async (task, subject) => {
  // Ensure we have a valid date string for the HTML template
  const formattedDate = task.deadline 
    ? new Date(task.deadline).toLocaleString() 
    : "No deadline set";

  const mailOptions = {
    from: `"OJT Tracker Notifications" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL, // The recipient defined in your .env
    subject: subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px; max-width: 600px; margin: auto; color: #333;">
        <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">${subject}</h2>
        <p style="font-size: 16px;">Hello! This is a system notification regarding your OJT task.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Task:</strong> ${task.title}</p>
          <p><strong>Description:</strong> ${task.description}</p>
          <p style="color: #d9534f;"><strong>Deadline:</strong> ${formattedDate}</p>
        </div>

        <p style="font-size: 14px; color: #666;">You can view more details in your dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">This is an automated message. Please do not reply.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully: ", info.messageId);
    return info;
  } catch (error) {
    // Better logging for common Gmail issues
    if (error.code === 'EAUTH') {
      console.error("❌ Email Auth Failed: Check if your App Password is correct and has no spaces.");
    } else {
      console.error("❌ Email send error: ", error.message);
    }
    throw error;
  }
};