const activityRepo = require("../repositories/activityRepository");
const { uploadToDrive } = require("../services/driveService");
const { syncToCalendar, deleteCalendarEvent } = require("../services/calendarService");

// CREATE
exports.createActivity = async (req, res, next) => {
  try {
    const { title, description, deadline } = req.body;
    const userId = req.user.id;

    const driveLink = req.file ? await uploadToDrive(req.file) : null;
    const calendarEventId = deadline
      ? await syncToCalendar({ title, description, deadline })
      : null;

    const result = await activityRepo.insert(
      title, description, driveLink, deadline, calendarEventId, userId
    );

    const activity = result.rows[0];
    activity.calendar_synced = !!calendarEventId;
    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
};

// READ (paginated)
exports.getActivities = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [result, countResult] = await Promise.all([
      activityRepo.findAllByUser(req.user.id, limit, offset),
      activityRepo.countByUser(req.user.id),
    ]);

    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      activities: result.rows,
      page,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
exports.updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, deadline } = req.body;
    const userId = req.user.id;

    const current = await activityRepo.findByIdAndUser(id, userId);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: "Task not found or unauthorized" });
    }

    const existing = current.rows[0];
    let driveLink = req.body.existing_link || existing.drive_link;
    if (req.file) driveLink = await uploadToDrive(req.file);

    const calendarId = deadline
      ? await syncToCalendar({ title, description, deadline }, existing.google_calendar_event_id)
      : existing.google_calendar_event_id;

    const result = await activityRepo.update(
      title, description, driveLink, deadline, calendarId, id, userId
    );

    const updated = result.rows[0];
    updated.calendar_synced = !!calendarId;
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE
exports.deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const current = await activityRepo.findByIdAndUser(id, userId);
    if (current.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized to delete this task" });
    }

    const eventId = current.rows[0].google_calendar_event_id;
    if (eventId) await deleteCalendarEvent(eventId);

    await activityRepo.remove(id, userId);
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
};

// STATS
exports.getActivityStats = async (req, res, next) => {
  try {
    const result = await activityRepo.getStatsByUser(req.user.id);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};