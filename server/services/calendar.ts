import { google } from 'googleapis';

async function getUncachableGoogleCalendarClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error('Google Calendar service account not configured: set GOOGLE_SERVICE_ACCOUNT');
  }

  let key: any;
  try {
    key = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT JSON');
  }

  if (!key.client_email || !key.private_key) {
    throw new Error('Invalid service account key for Google Calendar');
  }

  const jwtClient = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  } as any);

  await jwtClient.authorize();

  return google.calendar({ version: 'v3', auth: jwtClient });
}

export async function createCalendarEvent(
  title: string,
  description: string | null,
  date: Date,
  location: string | null
): Promise<{ eventId: string; eventUrl: string }> {
  const calendar = await getUncachableGoogleCalendarClient();

  const endDate = new Date(date);
  endDate.setHours(endDate.getHours() + 2);

  const event = {
    summary: title,
    location: location || undefined,
    description: description || undefined,
    start: {
      dateTime: date.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'UTC',
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  if (!response.data.id || !response.data.htmlLink) {
    throw new Error('Failed to create calendar event');
  }

  return {
    eventId: response.data.id,
    eventUrl: response.data.htmlLink,
  };
}

export async function updateCalendarEvent(
  eventId: string,
  title: string,
  description: string | null,
  date: Date,
  location: string | null
): Promise<void> {
  const calendar = await getUncachableGoogleCalendarClient();

  const endDate = new Date(date);
  endDate.setHours(endDate.getHours() + 2);

  const event = {
    summary: title,
    location: location || undefined,
    description: description || undefined,
    start: {
      dateTime: date.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'UTC',
    },
  };

  await calendar.events.update({
    calendarId: 'primary',
    eventId: eventId,
    requestBody: event,
  });
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const calendar = await getUncachableGoogleCalendarClient();

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId,
  });
}
