const { calendar } = require("../config/googleConfig");

const buildEvent = (activity) => ({
  summary: `OJT Task: ${activity.title}`,
  description: activity.description,
  start: { dateTime: new Date(activity.deadline).toISOString() },
  end: { dateTime: new Date(new Date(activity.deadline).getTime() + 3600000).toISOString() },
});

exports.syncToCalendar = async (activity, existingEventId = null) => {
  const event = buildEvent(activity);

  try {
    if (existingEventId) {
      const res = await calendar.events.update({
        calendarId: "primary",
        eventId: existingEventId,
        requestBody: event,
      });
      return res.data.id;
    }

    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });
    return res.data.id;
  } catch (error) {
    console.error("Calendar Sync Error:", error.message);
    return existingEventId;
  }
};

exports.deleteCalendarEvent = async (eventId) => {
  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
  } catch (error) {
    console.error("Could not delete calendar event:", error.message);
  }
};
