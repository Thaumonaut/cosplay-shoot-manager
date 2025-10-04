import { apiRequest, queryClient } from './queryClient';

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
export default async function appendAndPersist(
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
  // Update the appropriate ref
  if (type === 'personnel' && refs.personnelRef) {
    refs.personnelRef.current = [...refs.personnelRef.current, newId];
    setters.setSelectedPersonnel?.((prev: string[]) => [...prev, newId]);
  } else if (type === 'equipment' && refs.equipmentRef) {
    refs.equipmentRef.current = [...refs.equipmentRef.current, newId];
    setters.setSelectedEquipment?.((prev: string[]) => [...prev, newId]);
  } else if (type === 'prop' && refs.propsRef) {
    refs.propsRef.current = [...refs.propsRef.current, newId];
    setters.setSelectedProps?.((prev: string[]) => [...prev, newId]);
  } else if (type === 'costume' && refs.costumesRef) {
    refs.costumesRef.current = [...refs.costumesRef.current, newId];
    setters.setSelectedCostumes?.((prev: string[]) => [...prev, newId]);
  }

  // If editing an existing shoot, persist the association
  if (!isNew && id) {
    try {
      const endpoint = `/api/shoots/${id}/${type === 'prop' ? 'props' : type}s`;
      await apiRequest('POST', endpoint, { [`${type}Id`]: newId });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/shoots/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/shoots/${id}/${type === 'prop' ? 'props' : type}s`] });
    } catch (error) {
      console.error(`Failed to persist ${type} association:`, error);
      throw error;
    }
  }
}