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

// Partially mock react-query: keep actual exports but override useQuery
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
      if (key?.includes('/api/shoots') && !key.includes('participants')) return { data: { id: 'test-id', title: 'Test Shoot' } };
      return { data: [] };
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
vi.mock('@/lib/queryClient', async () => {
  const actual = await vi.importActual<any>('@@/lib/queryClient'.replace('@@', '@/'));
  return {
    ...actual,
    apiRequest: (...args: any[]) => apiRequestMock(...args),
  };
});

import ShootPage from './ShootPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('ShootPage header buttons', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    // default mock resolves with a json method to satisfy callers
    apiRequestMock.mockResolvedValue({ json: async () => ({ message: 'ok' }), ok: true });
  });

  it('calls the correct endpoints for calendar, docs, reminders, and delete', async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ShootPage />
      </QueryClientProvider>
    );

    const user = userEvent.setup();

    // Calendar
    const calBtn = await screen.findByTestId('button-create-calendar');
    await user.click(calBtn);
    await waitFor(() => {
      expect(apiRequestMock).toHaveBeenCalledWith('POST', `/api/shoots/test-id/create-calendar-event`, {});
    });

    // Docs
    apiRequestMock.mockClear();
    const docsBtn = await screen.findByTestId('button-create-docs');
    await user.click(docsBtn);
    await waitFor(() => {
      expect(apiRequestMock).toHaveBeenCalledWith('POST', `/api/shoots/test-id/docs`, {});
    });

    // Send Reminders
    apiRequestMock.mockClear();
    const remindersBtn = await screen.findByTestId('button-send-reminders');
    await user.click(remindersBtn);
    await waitFor(() => {
      expect(apiRequestMock).toHaveBeenCalledWith('POST', `/api/shoots/test-id/send-reminders`, {});
    });

    // Delete
    apiRequestMock.mockClear();
    const deleteBtn = await screen.findByTestId('button-delete');
    await user.click(deleteBtn);
    await waitFor(() => {
      expect(apiRequestMock).toHaveBeenCalledWith('DELETE', `/api/shoots/test-id`);
    });
  });
});
