const pool = require("../config/db");
const { drive, calendar } = require("../config/googleConfig"); // Imported pre-configured clients
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
    let driveLink = req.file ? await uploadToDrive(req.file) : null;
    
    let calendarEventId = null;
    if (deadline) {
      calendarEventId = await syncToCalendar({ title, description, deadline });
    }

    const newActivity = await pool.query(
      `INSERT INTO activities (title, description, drive_link, deadline, google_calendar_event_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, driveLink, deadline, calendarEventId]
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
    const activities = await pool.query("SELECT * FROM activities ORDER BY id DESC");
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
    
    const current = await pool.query("SELECT * FROM activities WHERE id = $1", [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: "Not found" });

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
       WHERE id = $6 RETURNING *`,
      [title, description, driveLink, deadline, newCalendarId, id]
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
    const current = await pool.query("SELECT google_calendar_event_id FROM activities WHERE id = $1", [id]);
    
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

    await pool.query("DELETE FROM activities WHERE id = $1", [id]);
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};