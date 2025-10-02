import { getGoogleDocsClient } from './google-docs';
import { google } from 'googleapis';
import type { Shoot } from '@shared/schema';

export async function createShootDocument(shoot: any, details: any) {
  try {
    const docsClient = await getGoogleDocsClient();
    const driveClient = google.drive({ version: 'v3', auth: docsClient.context._options.auth as any });

    // Create a new document
    const doc = await docsClient.documents.create({
      requestBody: {
        title: `${shoot.title} - Shoot Plan`,
      },
    });

    const documentId = doc.data.documentId!;

    // Build the content
    const requests = buildDocumentContent(shoot, details);

    // Batch update the document with content
    await docsClient.documents.batchUpdate({
      documentId,
      requestBody: {
        requests,
      },
    });

    // Get the document URL
    const file = await driveClient.files.get({
      fileId: documentId,
      fields: 'webViewLink',
    });

    return {
      docId: documentId,
      docUrl: file.data.webViewLink || `https://docs.google.com/document/d/${documentId}/edit`,
    };
  } catch (error) {
    console.error('Error creating shoot document:', error);
    throw error;
  }
}

export async function updateShootDocument(docId: string, shoot: any, details: any) {
  try {
    const docsClient = await getGoogleDocsClient();

    // Get current document to find the end index
    const doc = await docsClient.documents.get({
      documentId: docId,
    });

    const endIndex = doc.data.body?.content?.[doc.data.body.content.length - 1]?.endIndex || 1;

    // Delete all content except the first newline
    const deleteRequests = [{
      deleteContentRange: {
        range: {
          startIndex: 1,
          endIndex: endIndex - 1,
        },
      },
    }];

    await docsClient.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: deleteRequests,
      },
    });

    // Insert new content
    const insertRequests = buildDocumentContent(shoot, details);

    await docsClient.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: insertRequests,
      },
    });

    return {
      docId,
      docUrl: `https://docs.google.com/document/d/${docId}/edit`,
    };
  } catch (error) {
    console.error('Error updating shoot document:', error);
    throw error;
  }
}

function buildDocumentContent(shoot: any, details: any) {
  const requests: any[] = [];
  let currentIndex = 1;

  // Helper to add text
  const addText = (text: string, style?: any) => {
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text,
      },
    });
    if (style) {
      requests.push({
        updateTextStyle: {
          range: {
            startIndex: currentIndex,
            endIndex: currentIndex + text.length,
          },
          textStyle: style,
          fields: Object.keys(style).join(','),
        },
      });
    }
    currentIndex += text.length;
  };

  // Title
  addText(`${shoot.title}\n`, { bold: true, fontSize: { magnitude: 24, unit: 'PT' } });
  addText('\n');

  // Basic Info
  addText('Shoot Details\n', { bold: true, fontSize: { magnitude: 16, unit: 'PT' } });
  addText(`Status: ${shoot.status}\n`);
  if (shoot.date) {
    const dateStr = new Date(shoot.date).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    addText(`Date: ${dateStr}\n`);
  }
  if (shoot.time) {
    addText(`Time: ${shoot.time}\n`);
  }
  if (shoot.durationMinutes) {
    const hours = Math.floor(shoot.durationMinutes / 60);
    const minutes = shoot.durationMinutes % 60;
    const durationStr = hours > 0 
      ? `${hours}h ${minutes}m` 
      : `${minutes}m`;
    addText(`Duration: ${durationStr}\n`);
  }
  addText('\n');

  // Location
  if (details.location) {
    addText('Location\n', { bold: true, fontSize: { magnitude: 16, unit: 'PT' } });
    addText(`${details.location.name}\n`);
    if (details.location.address) {
      addText(`${details.location.address}\n`);
    }
    if (details.location.notes) {
      addText(`Notes: ${details.location.notes}\n`);
    }
    addText('\n');
  }

  // Notes
  if (shoot.notes) {
    addText('Notes\n', { bold: true, fontSize: { magnitude: 16, unit: 'PT' } });
    addText(`${shoot.notes}\n\n`);
  }

  // Characters/Costumes
  if (details.costumes && details.costumes.length > 0) {
    addText('Characters/Costumes\n', { bold: true, fontSize: { magnitude: 16, unit: 'PT' } });
    details.costumes.forEach((costume: any) => {
      addText(`• ${costume.characterName}`);
      if (costume.seriesName) {
        addText(` - ${costume.seriesName}`);
      }
      addText('\n');
    });
    addText('\n');
  }

  // Personnel
  if (details.participants && details.participants.length > 0) {
    addText('Team\n', { bold: true, fontSize: { magnitude: 16, unit: 'PT' } });
    details.participants.forEach((participant: any) => {
      addText(`• ${participant.name}`);
      if (participant.role) {
        addText(` - ${participant.role}`);
      }
      if (participant.email) {
        addText(` (${participant.email})`);
      }
      addText('\n');
    });
    addText('\n');
  }

  // Equipment
  if (details.equipment && details.equipment.length > 0) {
    addText('Equipment\n', { bold: true, fontSize: { magnitude: 16, unit: 'PT' } });
    details.equipment.forEach((item: any) => {
      addText(`• ${item.name}`);
      if (item.category) {
        addText(` (${item.category})`);
      }
      addText('\n');
    });
    addText('\n');
  }

  // Props
  if (details.props && details.props.length > 0) {
    addText('Props\n', { bold: true, fontSize: { magnitude: 16, unit: 'PT' } });
    details.props.forEach((prop: any) => {
      addText(`• ${prop.name}\n`);
    });
    addText('\n');
  }

  // Reference Links
  if (shoot.instagramLinks && shoot.instagramLinks.length > 0) {
    addText('Reference Links\n', { bold: true, fontSize: { magnitude: 16, unit: 'PT' } });
    shoot.instagramLinks.forEach((link: string) => {
      addText(`• ${link}\n`);
    });
    addText('\n');
  }

  return requests;
}
