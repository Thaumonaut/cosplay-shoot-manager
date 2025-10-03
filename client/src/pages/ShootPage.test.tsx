/// <reference types="vitest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Partially mock react-query: keep actual exports (QueryClient etc.) but override useQuery
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<any>('@tanstack/react-query');
  return {
    ...actual,
    useQuery: (opts: any) => {
      const key = opts?.queryKey?.join?.('/');
      if (key?.includes('/api/shoots') && key?.includes('participants')) {
        return { data: [{ id: 'p1', personnelId: 'person-1', name: 'Alice' }] };
      }
      if (key?.includes('/api/personnel')) {
        return { data: [{ id: 'person-1', name: 'Alice', avatarUrl: '' }] };
      }
      if (key?.includes('/api/equipment')) return { data: [] };
      if (key?.includes('/api/props')) return { data: [] };
      if (key?.includes('/api/costumes')) return { data: [] };
      if (key?.includes('/api/locations')) return { data: [] };
      if (key?.includes('/api/shoots') && !key.includes('participants')) return { data: { id: '1', title: 'Test Shoot' } };
      return { data: [] };
    },
  };
});

import ShootPage from './ShootPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('ShootPage render', () => {
  it('renders participants section', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ShootPage />
      </QueryClientProvider>
    );
    expect(screen.getByText(/Team/i)).toBeInTheDocument();
  });
});
