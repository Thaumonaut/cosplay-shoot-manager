/// <reference types="vitest" />
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createCalendarEvent, createDocs, sendReminders, deleteShoot } from './shootActions';

const apiRequestMock = vi.fn();

vi.mock('@/lib/queryClient', () => ({
  __esModule: true,
  apiRequest: (...args: any[]) => apiRequestMock(...args),
}));

describe('shootActions', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    apiRequestMock.mockResolvedValue({ json: async () => ({ message: 'ok' }), ok: true });
  });

  it('createCalendarEvent calls correct endpoint', async () => {
    await createCalendarEvent('abc');
    expect(apiRequestMock).toHaveBeenCalledWith('POST', '/api/shoots/abc/create-calendar-event', {});
  });

  it('createDocs calls correct endpoint', async () => {
    await createDocs('abc');
    expect(apiRequestMock).toHaveBeenCalledWith('POST', '/api/shoots/abc/docs', {});
  });

  it('sendReminders calls correct endpoint', async () => {
    await sendReminders('abc');
    expect(apiRequestMock).toHaveBeenCalledWith('POST', '/api/shoots/abc/send-reminders', {});
  });

  it('deleteShoot calls correct endpoint', async () => {
    await deleteShoot('abc');
    expect(apiRequestMock).toHaveBeenCalledWith('DELETE', '/api/shoots/abc');
  });
});
