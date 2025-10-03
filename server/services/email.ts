import { getResendClient } from '../resend-client';

interface ShootReminderData {
  shootTitle: string;
  shootDate: Date;
  shootLocation?: string;
  participantEmail: string;
  participantName: string;
}

// Helper to escape HTML to prevent injection
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendShootReminder(data: ShootReminderData): Promise<void> {
  const { client, fromEmail } = await getResendClient();

  // Use toLocaleString to include time (toLocaleDateString ignores hour/minute in Node.js)
  const formattedDate = data.shootDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  // Escape HTML to prevent injection
  const safeTitle = escapeHtml(data.shootTitle);
  const safeName = escapeHtml(data.participantName);
  const safeLocation = data.shootLocation ? escapeHtml(data.shootLocation) : null;

  const locationText = safeLocation ? `\nLocation: ${safeLocation}` : '';

  await client.emails.send({
    from: fromEmail,
    to: [data.participantEmail],
    subject: `Reminder: ${safeTitle} Photo Shoot`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .shoot-details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📸 Photo Shoot Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${safeName},</p>
            <p>This is a friendly reminder about your upcoming cosplay photo shoot:</p>
            
            <div class="shoot-details">
              <h2>${safeTitle}</h2>
              <p><strong>📅 When:</strong> ${formattedDate}</p>${safeLocation ? `\n              <p><strong>📍 Where:</strong> ${safeLocation}</p>` : ''}
            </div>
            
            <p>Looking forward to seeing you there! Make sure you have all your costumes and props ready.</p>
            
            <div class="footer">
              <p>Sent from your Cosplay Photo Shoot Tracker</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
