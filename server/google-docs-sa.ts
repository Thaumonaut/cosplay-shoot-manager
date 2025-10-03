import { google } from 'googleapis';

let cachedClient: any | null = null;

/**
 * Creates a Google Docs client using a service account JSON provided in
 * the environment variable GOOGLE_SERVICE_ACCOUNT. The value should be the
 * full service account JSON key (as a string). This creates docs under the
 * service account's drive. Note: service accounts cannot create files in a
 * user's personal Drive without domain delegation; users can make a copy of
 * the generated document into their own Drive.
 */
export async function getGoogleDocsClient() {
  if (cachedClient) return cachedClient;

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error('Google Docs service account not configured');
  }

  let key: any;
  try {
    key = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT JSON');
  }

  if (!key.client_email || !key.private_key) {
    throw new Error('Invalid service account key');
  }

  const jwtClient = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file',
    ],
  } as any);

  await jwtClient.authorize();

  cachedClient = google.docs({ version: 'v1', auth: jwtClient });
  return cachedClient;
}
