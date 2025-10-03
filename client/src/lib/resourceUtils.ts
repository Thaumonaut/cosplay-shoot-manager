export function extractIds(items: any[], idKeys: string[] = ['id', 'equipmentId', 'equipment_id', 'propId', 'prop_id', 'costumeId', 'costume_id']) {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    if (!item) return null;
    for (const key of idKeys) {
      if (item[key]) return item[key];
    }
    return null;
  }).filter(Boolean);
}
