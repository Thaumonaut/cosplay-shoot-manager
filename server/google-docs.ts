import { google } from 'googleapis';

// This helper is retained primarily to support code paths that expect a
// user-consent-based OAuth client. However, we've moved to a service
// account implementation (see google-docs-sa). If the environment contains
// a service account key, prefer that. Otherwise, surface a clear error
// instructing how to configure the service account.
export async function getGoogleDocsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error('Google Docs service account not configured: set GOOGLE_SERVICE_ACCOUNT');
  }

  let key: any;
  try {
    key = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT JSON');
  }

  if (!key.client_email || !key.private_key) {
    throw new Error('Invalid service account key for Google Docs');
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

  return google.docs({ version: 'v1', auth: jwtClient });
}
