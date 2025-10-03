/// <reference types="vitest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Partial mock of react-query like other tests
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

// Mock wouter so useParams returns an existing shoot id (so isNew = false)
vi.mock('wouter', () => ({
  useParams: () => ({ id: '1' }),
  useLocation: () => ['/shoots/1', vi.fn()],
}));

// Mock the create-dialog components to simple buttons that call onSave when clicked
vi.mock('@/components/CreateEquipmentDialog', () => ({
  CreateEquipmentDialog: (props: any) => (
    <button data-testid="mock-create-equipment" onClick={() => props.onSave && props.onSave({ id: 'eq-1' })}>Mock Create Equipment</button>
  ),
}));
vi.mock('@/components/CreatePropsDialog', () => ({
  CreatePropsDialog: (props: any) => (
    <button data-testid="mock-create-prop" onClick={() => props.onSave && props.onSave({ id: 'prop-1' })}>Mock Create Prop</button>
  ),
}));
vi.mock('@/components/CreateCostumesDialog', () => ({
  CreateCostumesDialog: (props: any) => (
    <button data-testid="mock-create-costume" onClick={() => props.onSave && props.onSave({ id: 'cost-1' })}>Mock Create Costume</button>
  ),
}));

// Simplify StatusBadge for this test so it doesn't depend on statusConfig
vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: (props: any) => <span data-testid="mock-status">{props.status || 'idea'}</span>,
}));

import ShootPage from '../ShootPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('ShootPage integration dialog -> onSave (mocked dialogs)', () => {
  let patchCalls: any[] = [];

  beforeEach(() => {
    patchCalls = [];
    // mock fetch to capture PATCH to /api/shoots/:id/resources
    global.fetch = vi.fn().mockImplementation((url: any, opts: any) => {
      // capture PATCH to shoot resources
      if (typeof url === 'string' && url.includes('/api/shoots/') && opts && opts.method === 'PATCH') {
        try {
          const body = opts.body ? JSON.parse(opts.body) : undefined;
          patchCalls.push({ url, body });
        } catch (e) {
          patchCalls.push({ url, body: undefined });
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      // default response
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }) as any;
  });

  it('appends equipment and calls PATCH when equipment is created', async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ShootPage />
      </QueryClientProvider>
    );

    const btn = await screen.findByTestId('mock-create-equipment');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(patchCalls.length).toBeGreaterThan(0);
    });
    expect(patchCalls[0].body).toBeTruthy();
    expect(patchCalls[0].body.equipmentIds || []).toBeDefined();
  });

  it('appends prop and calls PATCH when prop is created', async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ShootPage />
      </QueryClientProvider>
    );

    const btn = await screen.findByTestId('mock-create-prop');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(patchCalls.length).toBeGreaterThan(0);
    });
    expect(patchCalls[0].body).toBeTruthy();
    expect(patchCalls[0].body.propIds || []).toBeDefined();
  });

  it('appends costume and calls PATCH when costume is created', async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <ShootPage />
      </QueryClientProvider>
    );

    const btn = await screen.findByTestId('mock-create-costume');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(patchCalls.length).toBeGreaterThan(0);
    });
    expect(patchCalls[0].body).toBeTruthy();
    expect(patchCalls[0].body.costumeIds || []).toBeDefined();
  });
});
