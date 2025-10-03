import { vi, describe, it, expect, beforeEach } from 'vitest';
import appendAndPersist from '../appendAndPersist';
import * as qc from '../queryClient';

vi.mock('../queryClient', async () => {
  const actual = await vi.importActual<any>('../queryClient');
  return {
    ...actual,
    apiRequest: vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    queryClient: { invalidateQueries: vi.fn() },
  };
});

describe('appendAndPersist', () => {
  beforeEach(() => {
    (qc.apiRequest as any).mockClear?.();
    (qc.queryClient.invalidateQueries as any).mockClear?.();
  });

  it('updates refs and calls apiRequest when editing existing shoot', async () => {
    const refs = {
      personnelRef: { current: ['p1'] },
      equipmentRef: { current: ['e1'] },
      propsRef: { current: ['pr1'] },
      costumesRef: { current: ['c1'] },
    } as any;

    const setters = {
      setSelectedEquipment: vi.fn((fn: any) => fn(['e1'])),
    } as any;

    await appendAndPersist('equipment', 'e2', refs, setters, false, '1');

    expect(qc.apiRequest).toHaveBeenCalled();
    expect(qc.queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['/api/shoots', '1'] });
  });
});
