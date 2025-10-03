import { getGoogleDocsClient } from '../google-docs-sa';
import type { Shoot, ShootParticipant, ShootReference } from '@shared/schema';
import { format } from 'date-fns';

interface ShootWithDetails extends Shoot {
  participants: ShootParticipant[];
  references: ShootReference[];
  location?: any;
  equipment?: any[];
  props?: any[];
  costumes?: any[];
}

export async function updateShootDocument(docId: string, shoot: ShootWithDetails, providedDocsClient?: any): Promise<{ docId: string; docUrl: string }> {
  const docs = providedDocsClient || await getGoogleDocsClient();

  // Get current document to find the end index
  const doc = await docs.documents.get({
    documentId: docId,
  });

  const endIndex = doc.data.body?.content?.[doc.data.body.content.length - 1]?.endIndex || 1;

  // Delete all content except the first newline
  if (endIndex > 2) {
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [{
          deleteContentRange: {
            range: {
              startIndex: 1,
              endIndex: endIndex - 1,
            },
          },
        }],
      },
    });
  }

  // Build new content
  const requests: any[] = [];
  let currentIndex = 1;

  requests.push({
    insertText: {
      location: { index: currentIndex },
      text: `${shoot.title}\n\n`,
    },
  });
  currentIndex += shoot.title.length + 2;

  requests.push({
    updateParagraphStyle: {
      range: {
        startIndex: 1,
        endIndex: shoot.title.length + 1,
      },
      paragraphStyle: {
        namedStyleType: 'HEADING_1',
        alignment: 'CENTER',
      },
      fields: 'namedStyleType,alignment',
    },
  });

  requests.push({
    updateTextStyle: {
      range: {
        startIndex: 1,
        endIndex: shoot.title.length + 1,
      },
      textStyle: {
        bold: true,
        fontSize: {
          magnitude: 24,
          unit: 'PT',
        },
      },
      fields: 'bold,fontSize',
    },
  });

  const sections = [];

  const detailsParts = [
    `Status: ${shoot.status.charAt(0).toUpperCase() + shoot.status.slice(1)}`,
    shoot.date ? `Date: ${format(new Date(shoot.date), 'EEEE, MMMM d, yyyy')}` : null,
    shoot.time ? `Time: ${shoot.time}` : null,
    shoot.durationMinutes ? `Duration: ${Math.floor(shoot.durationMinutes / 60)}h ${shoot.durationMinutes % 60}m` : null,
  ].filter(Boolean);

  if (shoot.location) {
    detailsParts.push(`Location: ${shoot.location.name}`);
    if (shoot.location.address) {
      detailsParts.push(`Address: ${shoot.location.address}`);
    }
  } else if (shoot.locationNotes) {
    detailsParts.push(`Location: ${shoot.locationNotes}`);
  }

  sections.push({
    heading: 'Shoot Details',
    content: detailsParts.join('\n'),
  });

  if (shoot.description) {
    sections.push({
      heading: 'Description',
      content: shoot.description,
    });
  }

  if (shoot.participants.length > 0) {
    sections.push({
      heading: 'Participants',
      content: shoot.participants
        .map((p) => `• ${p.name} - ${p.role}${p.email ? ` (${p.email})` : ''}`)
        .join('\n'),
    });
  }

  if (shoot.equipment && shoot.equipment.length > 0) {
    sections.push({
      heading: 'Equipment',
      content: shoot.equipment
        .map((e: any) => `• ${e.name}${e.category ? ` (${e.category})` : ''}`)
        .join('\n'),
    });
  }

  if (shoot.props && shoot.props.length > 0) {
    sections.push({
      heading: 'Props',
      content: shoot.props
        .map((p: any) => `• ${p.name}`)
        .join('\n'),
    });
  }

  if (shoot.costumes && shoot.costumes.length > 0) {
    sections.push({
      heading: 'Characters/Costumes',
      content: shoot.costumes
        .map((c: any) => `• ${c.characterName}${c.seriesName ? ` - ${c.seriesName}` : ''}`)
        .join('\n'),
    });
  }

  if (shoot.references.length > 0) {
    const imageRefs = shoot.references.filter((r) => r.type === 'image');
    const instagramRefs = shoot.references.filter((r) => r.type === 'instagram');

    if (imageRefs.length > 0) {
      sections.push({
        heading: 'Reference Images',
        content: imageRefs.map((r, i) => `${i + 1}. ${r.url}`).join('\n'),
      });
    }

    if (instagramRefs.length > 0) {
      sections.push({
        heading: 'Instagram References',
        content: instagramRefs.map((r, i) => `${i + 1}. ${r.url}`).join('\n'),
      });
    }
  }

  if (shoot.instagramLinks && shoot.instagramLinks.length > 0) {
    sections.push({
      heading: 'Instagram Links',
      content: shoot.instagramLinks.map((link, i) => `${i + 1}. ${link}`).join('\n'),
    });
  }

  for (const section of sections) {
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: `${section.heading}\n`,
      },
    });
    
    const headingStart = currentIndex;
    const headingEnd = currentIndex + section.heading.length;
    currentIndex += section.heading.length + 1;

    requests.push({
      updateParagraphStyle: {
        range: {
          startIndex: headingStart,
          endIndex: headingEnd,
        },
        paragraphStyle: {
          namedStyleType: 'HEADING_2',
        },
        fields: 'namedStyleType',
      },
    });

    requests.push({
      updateTextStyle: {
        range: {
          startIndex: headingStart,
          endIndex: headingEnd,
        },
        textStyle: {
          bold: true,
          fontSize: {
            magnitude: 14,
            unit: 'PT',
          },
        },
        fields: 'bold,fontSize',
      },
    });

    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: `${section.content}\n\n`,
      },
    });
    currentIndex += section.content.length + 2;
  }

  const footerText = `\n\nUpdated by CosPlans on ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}`;
  requests.push({
    insertText: {
      location: { index: currentIndex },
      text: footerText,
    },
  });

  requests.push({
    updateTextStyle: {
      range: {
        startIndex: currentIndex,
        endIndex: currentIndex + footerText.length,
      },
      textStyle: {
        italic: true,
        fontSize: {
          magnitude: 9,
          unit: 'PT',
        },
        foregroundColor: {
          color: {
            rgbColor: {
              red: 0.5,
              green: 0.5,
              blue: 0.5,
            },
          },
        },
      },
      fields: 'italic,fontSize,foregroundColor',
    },
  });

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests,
    },
  });

  const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

  return { docId, docUrl };
}
