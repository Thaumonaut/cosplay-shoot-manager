import { apiRequest } from '@/lib/queryClient';

export async function createCalendarEvent(shootId: string) {
  return await apiRequest('POST', `/api/shoots/${shootId}/create-calendar-event`, {});
}

export async function createCalendarWithProvider(shootId: string) {
  return await apiRequest('POST', `/api/google/from-provider/calendar`, { shootId });
}

export async function createDocs(shootId: string, shootSnapshot?: any) {
  const body = shootSnapshot ? { shoot: shootSnapshot } : {};
  return await apiRequest('POST', `/api/shoots/${shootId}/docs`, body);
}

export async function createDocsWithProvider(shootId: string) {
  return await apiRequest('POST', `/api/google/from-provider/docs`, { shootId });
}

export async function sendReminders(shootId: string) {
  return await apiRequest('POST', `/api/shoots/${shootId}/send-reminders`, {});
}

export async function deleteShoot(shootId: string) {
  return await apiRequest('DELETE', `/api/shoots/${shootId}`);
}
