import React, { useRef, useState } from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import appendAndPersist from '@/lib/appendAndPersist';

// Lightweight test component that mimics the minimal pieces of ShootPage we need
function TestShoot({ onPatch }: { onPatch: (body: any) => void }) {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const equipmentRef = useRef(selectedEquipment);
  equipmentRef.current = selectedEquipment;

  // mock refs map
  const refs = {
    personnelRef: { current: [] },
    equipmentRef,
    propsRef: { current: [] },
    costumesRef: { current: [] },
  } as any;

  // Override apiRequest globally via fetch in this test; the onPatch will capture
  // handled by the global.fetch mock in beforeEach

  return (
    <div>
      <button data-testid="mock-create-equipment" onClick={async () => {
        // Simulate dialog calling onSave with created equipment
        const newId = 'eq-test-1';
        await appendAndPersist('equipment', newId, refs, { setSelectedEquipment }, false, '1');
      }}>Create Equipment</button>
    </div>
  );
}

describe('ShootPage small integration - dialog -> appendAndPersist', () => {
  let patchCalls: any[] = [];

  beforeEach(() => {
    patchCalls = [];
    global.fetch = vi.fn().mockImplementation((url: any, opts: any) => {
      if (typeof url === 'string' && url.includes('/api/shoots/') && opts && opts.method === 'PATCH') {
        try {
          const body = opts.body ? JSON.parse(opts.body) : undefined;
          patchCalls.push({ url, body });
        } catch (e) {
          patchCalls.push({ url, body: undefined });
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }) as any;
  });

  it('sends PATCH when equipment created via dialog', async () => {
    render(<TestShoot onPatch={(b) => patchCalls.push(b)} />);
    const btn = await screen.findByTestId('mock-create-equipment');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(patchCalls.length).toBeGreaterThan(0);
    });
    expect(patchCalls[0].body).toBeTruthy();
    expect(patchCalls[0].body.equipmentIds).toBeDefined();
  });
});
