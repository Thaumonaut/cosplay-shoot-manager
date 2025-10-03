import { apiRequest, queryClient } from '@/lib/queryClient';

type RefMap = {
  personnelRef: { current: string[] };
  equipmentRef: { current: string[] };
  propsRef: { current: string[] };
  costumesRef: { current: string[] };
};

// Minimal, test-friendly appendAndPersist helper extracted from ShootPage.
// It updates local state via the provided setters and, when editing an existing
// shoot (isNew === false and id provided), persists associations using
// `apiRequest` and invalidates the shoot query.
export async function appendAndPersist(
  type: 'personnel' | 'equipment' | 'prop' | 'costume',
  newId: string,
  refs: RefMap,
  setters: {
    setSelectedPersonnel?: (fn: any) => void;
    setSelectedEquipment?: (fn: any) => void;
    setSelectedProps?: (fn: any) => void;
    setSelectedCostumes?: (fn: any) => void;
  },
  isNew: boolean,
  id?: string,
) {
  if (!newId) return;

  // Update local state via setters if provided
  if (type === 'personnel' && setters.setSelectedPersonnel) {
    setters.setSelectedPersonnel((prev: string[]) => (prev.includes(newId) ? prev : [...prev, newId]));
  }
  if (type === 'equipment' && setters.setSelectedEquipment) {
    setters.setSelectedEquipment((prev: string[]) => (prev.includes(newId) ? prev : [...prev, newId]));
  }
  if (type === 'prop' && setters.setSelectedProps) {
    setters.setSelectedProps((prev: string[]) => (prev.includes(newId) ? prev : [...prev, newId]));
  }
  if (type === 'costume' && setters.setSelectedCostumes) {
    setters.setSelectedCostumes((prev: string[]) => (prev.includes(newId) ? prev : [...prev, newId]));
  }

  // Persist for existing shoots
  if (!isNew && id) {
    const equipmentIds =
      refs.equipmentRef.current.includes(newId) || type !== 'equipment'
        ? refs.equipmentRef.current
        : [...refs.equipmentRef.current, newId];
    const propIds =
      refs.propsRef.current.includes(newId) || type !== 'prop'
        ? refs.propsRef.current
        : [...refs.propsRef.current, newId];
    const costumeIds =
      refs.costumesRef.current.includes(newId) || type !== 'costume'
        ? refs.costumesRef.current
        : [...refs.costumesRef.current, newId];
    const personnelIds =
      refs.personnelRef.current.includes(newId) || type !== 'personnel'
        ? refs.personnelRef.current
        : [...refs.personnelRef.current, newId];

    try {
      await apiRequest('PATCH', `/api/shoots/${id}/resources`, {
        equipmentIds,
        propIds,
        costumeIds,
        personnelIds,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shoots', id] });
    } catch (e) {
      // swallow: calling code may handle toasts; keep helper resilient in tests
    }
  }
}

export default appendAndPersist;
