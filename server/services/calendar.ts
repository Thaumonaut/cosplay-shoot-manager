import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

async function getUncachableGoogleCalendarClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
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
