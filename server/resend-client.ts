import { Resend } from 'resend';

export async function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM;

  if (!apiKey) {
    throw new Error('Resend not configured: set RESEND_API_KEY');
  }
  if (!fromEmail) {
    throw new Error('Resend not configured: set RESEND_FROM_EMAIL');
  }

  return {
    client: new Resend(apiKey),
    fromEmail,
  };
}
