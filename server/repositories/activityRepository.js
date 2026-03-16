const pool = require("../config/db");

exports.insert = (title, description, driveLink, deadline, calendarEventId, userId) =>
  pool.query(
    `INSERT INTO activities (title, description, drive_link, deadline, google_calendar_event_id, user_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [title, description, driveLink, deadline, calendarEventId, userId]
  );

exports.findAllByUser = (userId, limit = 20, offset = 0) =>
  pool.query(
    "SELECT * FROM activities WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3",
    [userId, limit, offset]
  );

exports.countByUser = (userId) =>
  pool.query(
    "SELECT COUNT(*) FROM activities WHERE user_id = $1",
    [userId]
  );

exports.findByIdAndUser = (id, userId) =>
  pool.query(
    "SELECT * FROM activities WHERE id = $1 AND user_id = $2",
    [id, userId]
  );

exports.update = (title, description, driveLink, deadline, calendarId, id, userId) =>
  pool.query(
    `UPDATE activities SET title=$1, description=$2, drive_link=$3, deadline=$4,
     google_calendar_event_id=$5, reminder_sent=FALSE, deadline_alert_sent=FALSE
     WHERE id=$6 AND user_id=$7 RETURNING *`,
    [title, description, driveLink, deadline, calendarId, id, userId]
  );

exports.remove = (id, userId) =>
  pool.query("DELETE FROM activities WHERE id = $1 AND user_id = $2", [id, userId]);

exports.getStatsByUser = (userId) =>
  pool.query(
    `SELECT TO_CHAR(deadline, 'YYYY-MM-DD') as task_date, COUNT(*) as task_count
     FROM activities WHERE user_id=$1 AND deadline IS NOT NULL
     GROUP BY task_date ORDER BY task_date ASC`,
    [userId]
  );

exports.findPendingReminders = (now, futureTime) =>
  pool.query(
    `SELECT * FROM activities
     WHERE deadline <= $1 AND deadline > $2 AND reminder_sent = FALSE`,
    [futureTime, now]
  );

exports.markReminderSent = (id) =>
  pool.query("UPDATE activities SET reminder_sent = TRUE WHERE id = $1", [id]);

exports.findPendingAlerts = (now) =>
  pool.query(
    `SELECT * FROM activities
     WHERE deadline <= $1 AND deadline_alert_sent = FALSE`,
    [now]
  );

exports.markAlertSent = (id) =>
  pool.query("UPDATE activities SET deadline_alert_sent = TRUE WHERE id = $1", [id]);
