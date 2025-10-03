/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { extractIds, extractId } from './resourceUtils';

describe('extractIds', () => {
  it('extracts id from mixed shapes', () => {
    const items = [
      { equipmentId: 'e1' },
      { equipment_id: 'e2' },
      { id: 'e3' },
      null,
      undefined,
    ];

    const ids = extractIds(items);
    expect(ids).toEqual(['e1', 'e2', 'e3']);
  });

  it('extractId returns a single id from multiple possible keys', () => {
    expect(extractId({ equipmentId: 'e1' })).toBe('e1');
    expect(extractId({ equipment_id: 'e2' })).toBe('e2');
    expect(extractId({ id: 'e3' })).toBe('e3');
    expect(extractId(null)).toBeUndefined();
    expect(extractId(undefined)).toBeUndefined();
  });
});
