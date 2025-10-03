/// <reference types="vitest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock wouter to provide a stable id and a noop navigate
vi.mock('wouter', async () => {
  return {
    useLocation: () => ["/shoots/test-id", vi.fn()],
    useParams: () => ({ id: 'test-id' }),
  };
});

// Partially mock react-query: keep actual exports but override useQuery and provide a basic useMutation
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<any>('@tanstack/react-query');
  return {
    ...actual,
    useQuery: (opts: any) => {
      const key = opts?.queryKey?.join?.('/');
      if (key?.includes('/api/shoots') && key?.includes('participants')) {
        // return one participant so send reminders button is enabled
        return { data: [{ id: 'p1', personnelId: 'person-1', name: 'Alice' }] };
      }
      if (key?.includes('/api/personnel')) {
        return { data: [{ id: 'person-1', name: 'Alice', avatarUrl: '' }] };
      }
      if (key?.includes('/api/equipment')) return { data: [] };
      if (key?.includes('/api/props')) return { data: [] };
      if (key?.includes('/api/costumes')) return { data: [] };
      if (key?.includes('/api/locations')) return { data: [] };
      if (key?.includes('/api/shoots') && !key.includes('participants')) return { data: { id: 'test-id', title: 'Test Shoot', status: 'idea' } };
      return { data: [] };
    },
    useMutation: (opts: any) => {
      // Provide a simple mutate that calls the provided mutationFn and returns its result
      return {
        mutate: (...args: any[]) => {
          try {
            const res = opts?.mutationFn?.(...args);
            // return the promise so callers can await if needed
            return res;
          } catch (e) {
            // swallow errors in tests
            return Promise.reject(e);
          }
        },
        isPending: false,
        isError: false,
      };
    },
  };
});

// Mock the StatusBadge component to avoid icon rendering problems in jsdom
vi.mock('@/components/StatusBadge', () => {
  return {
    __esModule: true,
    StatusBadge: ({ status, className }: any) => React.createElement('span', { 'data-testid': `status-badge-${status}`, className }, status),
  };
});

// Mock apiRequest so we can assert it was called with the expected args
const apiRequestMock = vi.fn();
vi.mock('@/lib/queryClient', () => {
  return {
    __esModule: true,
    apiRequest: (...args: any[]) => apiRequestMock(...args),
    queryClient: {
      // minimal stub for any places that might import queryClient (not used here)
      invalidateQueries: () => {},
    },
  };
});

// Instead of rendering the full ShootPage (which pulls in many heavy UI pieces),
// render a small header-only test component that uses the same action helpers.
import { createCalendarEvent, createDocs, sendReminders, deleteShoot } from '@/lib/shootActions';

describe('ShootPage header buttons', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    // default mock resolves with a json method to satisfy callers
    apiRequestMock.mockResolvedValue({ json: async () => ({ message: 'ok' }), ok: true });
  });

  it('calls the correct endpoints for calendar, docs, reminders, and delete', async () => {
    // lightweight header that mirrors the ShootPage header actions
    function TestHeader({ shootId }: { shootId: string }) {
      return (
        <div>
          <button data-testid="button-create-calendar" onClick={() => createCalendarEvent(shootId)}>Calendar</button>
          <button data-testid="button-create-docs" onClick={() => createDocs(shootId)}>Docs</button>
          <button data-testid="button-send-reminders" onClick={() => sendReminders(shootId)}>Reminders</button>
          <button data-testid="button-delete" onClick={() => deleteShoot(shootId)}>Delete</button>
        </div>
      );
    }

    render(<TestHeader shootId="test-id" />);

    const user = userEvent.setup();

    const calBtn = await screen.findByTestId('button-create-calendar');
    await user.click(calBtn);
    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledWith('POST', `/api/shoots/test-id/create-calendar-event`, {}));

    apiRequestMock.mockClear();
    const docsBtn = await screen.findByTestId('button-create-docs');
    await user.click(docsBtn);
    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledWith('POST', `/api/shoots/test-id/docs`, {}));

    apiRequestMock.mockClear();
    const remindersBtn = await screen.findByTestId('button-send-reminders');
    await user.click(remindersBtn);
    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledWith('POST', `/api/shoots/test-id/send-reminders`, {}));

    apiRequestMock.mockClear();
    const deleteBtn = await screen.findByTestId('button-delete');
    await user.click(deleteBtn);
    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledWith('DELETE', `/api/shoots/test-id`));
  });
});
