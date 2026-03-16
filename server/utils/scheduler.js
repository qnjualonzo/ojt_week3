const cron = require("node-cron");
const activityRepo = require("../repositories/activityRepository");
const { sendEmail } = require("../services/emailService");

const startScheduler = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ Checking for deadlines...");
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
      // 24-hour reminders
      const reminders = await activityRepo.findPendingReminders(now, twentyFourHoursFromNow);
      for (const task of reminders.rows) {
        try {
          await sendEmail(task, "Upcoming Deadline Reminder (24h)");
          await activityRepo.markReminderSent(task.id);
          console.log(`📩 Sent 24h reminder for: ${task.title}`);
        } catch (err) {
          console.error(`Failed to send reminder for task ${task.id}:`, err.message);
        }
      }

      // Deadline alerts
      const alerts = await activityRepo.findPendingAlerts(now);
      for (const task of alerts.rows) {
        try {
          await sendEmail(task, "🚨 DEADLINE REACHED: Task Alert");
          await activityRepo.markAlertSent(task.id);
          console.log(`🚨 Sent deadline alert for: ${task.title}`);
        } catch (err) {
          console.error(`Failed to send alert for task ${task.id}:`, err.message);
        }
      }
    } catch (err) {
      console.error("Scheduler Error:", err);
    }
  });
};

module.exports = startScheduler;