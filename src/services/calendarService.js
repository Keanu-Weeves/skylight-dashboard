// Used by App.jsx to feed the GlanceView
export async function fetchUpcomingCalendarEvents(providerToken, members = []) {
  if (!providerToken) return [];

  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(now)}&singleEvents=true&orderBy=startTime&maxResults=8`;

  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${providerToken}` } });
    if (!response.ok) return [];

    const data = await response.json();
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    return (data.items || []).map((item) => {
      const startString = item.start?.dateTime || item.start?.date;
      const eventDate = new Date(startString);

      let dateLabel = "";
      if (eventDate.toDateString() === today.toDateString()) dateLabel = "Today";
      else if (eventDate.toDateString() === tomorrow.toDateString()) dateLabel = "Tomorrow";
      else dateLabel = eventDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });

      const matchedMember = members.find((member) =>
        item.summary?.toLowerCase().includes(member.name?.trim().toLowerCase())
      );

      return {
        id: item.id,
        title: item.summary || "Untitled Event",
        date: dateLabel,
        userColor: matchedMember?.color || "#e2e8f0",
      };
    });
  } catch (error) {
    console.error("Failed to fetch calendar events:", error);
    return [];
  }
}

// Used by GridView.jsx to pull the full calendar blocks
export async function fetchGridEvents(providerToken, timeMin, timeMax, members = []) {
  if (!providerToken) return [];
  
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`;

  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${providerToken}` } });
    if (!response.ok) throw new Error("Failed to fetch grid events");
    
    const data = await response.json();
    
    return (data.items || []).map(item => {
      const matchedMember = members.find((member) =>
        item.summary?.toLowerCase().includes(member.name?.trim().toLowerCase())
      );

      return {
        id: item.id,
        title: item.summary || "Untitled Event",
        start: new Date(item.start.dateTime || item.start.date),
        end: new Date(item.end.dateTime || item.end.date),
        userColor: matchedMember?.color || "#a0aab2",
        userId: matchedMember?.id || null,
        isGoogle: true
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Used by GridView.jsx to POST new events back to Google
export async function createGoogleEvent(providerToken, eventDetails) {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${providerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: eventDetails.title,
      start: {
        dateTime: eventDetails.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: eventDetails.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    })
  });

  if (!response.ok) {
    throw new Error("Failed to create event in Google Calendar");
  }
  
  return await response.json();
}