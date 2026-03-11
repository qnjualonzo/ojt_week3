const cron = require("node-cron");
const pool = require("../config/db");
const { sendEmail } = require("../services/emailService");

const startScheduler = () => {
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Checking for deadlines...");
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
      // A. 24-HOUR REMINDER
      const reminders = await pool.query(
        `SELECT * FROM activities 
         WHERE deadline <= $1 AND deadline > $2 AND reminder_sent = FALSE`,
        [twentyFourHoursFromNow, now]
      );

      for (let task of reminders.rows) {
        await sendEmail(task, "Upcoming Deadline Reminder (24h)");
        await pool.query("UPDATE activities SET reminder_sent = TRUE WHERE id = $1", [task.id]);
        console.log(`📩 Sent 24h reminder for: ${task.title}`);
      }

      // B. EXACT DEADLINE ALERT
      const alerts = await pool.query(
        `SELECT * FROM activities 
         WHERE deadline <= $1 AND deadline_alert_sent = FALSE`,
        [now]
      );

      for (let task of alerts.rows) {
        await sendEmail(task, "🚨 DEADLINE REACHED: Task Alert");
        await pool.query("UPDATE activities SET deadline_alert_sent = TRUE WHERE id = $1", [task.id]);
        console.log(`🚨 Sent deadline alert for: ${task.title}`);
      }
    } catch (err) {
      console.error("Scheduler Error:", err);
    }
  });
};

module.exports = startScheduler;