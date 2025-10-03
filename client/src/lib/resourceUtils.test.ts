/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { extractIds } from './resourceUtils';

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
});
