const pool = require("../config/db");
const { drive, calendar } = require("../config/googleConfig");
const stream = require("stream");
const { sendEmail } = require('../services/emailService');

// --- Helper: Google Calendar Logic ---
const syncToCalendar = async (activity, existingEventId = null) => {
  const event = {
    summary: `OJT Task: ${activity.title}`,
    description: activity.description,
    start: { dateTime: new Date(activity.deadline).toISOString() },
    end: { dateTime: new Date(new Date(activity.deadline).getTime() + 3600000).toISOString() },
  };

  try {
    if (existingEventId) {
      const res = await calendar.events.update({
        calendarId: 'primary',
        eventId: existingEventId,
        requestBody: event,
      });
      return res.data.id;
    } else {
      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
      return res.data.id;
    }
  } catch (error) {
    console.error("Calendar Sync Error:", error.message);
    return existingEventId; 
  }
};

// --- Helper: Drive Upload Logic ---
const uploadToDrive = async (fileObject) => {
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
};

// CREATE
exports.createActivity = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const userId = req.user.id; 
    
    let driveLink = req.file ? await uploadToDrive(req.file) : null;
    
    let calendarEventId = null;
    if (deadline) {
      calendarEventId = await syncToCalendar({ title, description, deadline });
    }

    const newActivity = await pool.query(
      `INSERT INTO activities (title, description, drive_link, deadline, google_calendar_event_id, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, driveLink, deadline, calendarEventId, userId]
    );

    res.status(201).json(newActivity.rows[0]);
  } catch (error) {
    console.error("Operation failed:", error);
    res.status(500).json({ error: "Server error during creation" });
  }
};

// READ
exports.getActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await pool.query(
      "SELECT * FROM activities WHERE user_id = $1 ORDER BY id DESC", 
      [userId]
    );
    res.status(200).json(activities.rows);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE
exports.updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline } = req.body;
    const userId = req.user.id;
    
    const current = await pool.query(
      "SELECT * FROM activities WHERE id = $1 AND user_id = $2", 
      [id, userId]
    );
    
    if (current.rows.length === 0) return res.status(404).json({ error: "Task not found or unauthorized" });

    const existingEventId = current.rows[0].google_calendar_event_id;
    let driveLink = req.body.existing_link || current.rows[0].drive_link; 
    if (req.file) driveLink = await uploadToDrive(req.file);

    let newCalendarId = existingEventId;
    if (deadline) {
      newCalendarId = await syncToCalendar({ title, description, deadline }, existingEventId);
    }

    const updatedActivity = await pool.query(
      `UPDATE activities SET title = $1, description = $2, drive_link = $3, deadline = $4, 
       google_calendar_event_id = $5, reminder_sent = FALSE, deadline_alert_sent = FALSE 
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [title, description, driveLink, deadline, newCalendarId, id, userId]
    );

    res.status(200).json(updatedActivity.rows[0]);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const current = await pool.query(
      "SELECT google_calendar_event_id FROM activities WHERE id = $1 AND user_id = $2", 
      [id, userId]
    );
    
    if (current.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized to delete this task" });
    }

    if (current.rows[0]?.google_calendar_event_id) {
      try {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: current.rows[0].google_calendar_event_id
        });
      } catch (calErr) {
        console.error("Could not delete calendar event:", calErr.message);
      }
    }

    await pool.query("DELETE FROM activities WHERE id = $1 AND user_id = $2", [id, userId]);
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// --- NEW: STATS FOR CHARTING ---
exports.getActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // This query groups tasks by date so you can see your workload over time
    const stats = await pool.query(
      `SELECT TO_CHAR(deadline, 'YYYY-MM-DD') as task_date, COUNT(*) as task_count 
       FROM activities 
       WHERE user_id = $1 AND deadline IS NOT NULL
       GROUP BY task_date 
       ORDER BY task_date ASC`,
      [userId]
    );

    res.status(200).json(stats.rows);
  } catch (error) {
    console.error("Stats fetch error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};