import { describe, it, expect } from 'vitest';
import { calculateSaddleStitch } from './saddleStitch';
import type { PageAssignment } from '../../types/imposition';

// Helper: collect source page indices per sheet+side for readability
function sheetPages(
  assignments: PageAssignment[],
  sheetIndex: number,
  side: 'back' | 'front',
): (number | null)[] {
  return assignments
    .filter((a) => a.sheetIndex === sheetIndex && a.side === side)
    .sort((a, b) => (a.position === 'left' ? -1 : 1) - (b.position === 'left' ? -1 : 1))
    .map((a) => a.sourcePageIndex);
}

describe('calculateSaddleStitch', () => {
  // ─── 4-page booklet ────────────────────────────────────────────────────────
  describe('4 pages', () => {
    it('returns 1 sheet', () => {
      const result = calculateSaddleStitch(4);
      expect(result).toHaveLength(4);
    });

    it('sheet 0 back = [3, 0] (0-indexed source pages)', () => {
      const result = calculateSaddleStitch(4) as PageAssignment[];
      expect(sheetPages(result, 0, 'back')).toEqual([3, 0]);
    });

    it('sheet 0 front = [1, 2] (0-indexed source pages)', () => {
      const result = calculateSaddleStitch(4) as PageAssignment[];
      expect(sheetPages(result, 0, 'front')).toEqual([1, 2]);
    });

    it('all source page indices appear exactly once', () => {
      const result = calculateSaddleStitch(4) as PageAssignment[];
      const indices = result.map((a) => a.sourcePageIndex).sort((a, b) => (a ?? -1) - (b ?? -1));
      expect(indices).toEqual([0, 1, 2, 3]);
    });
  });

  // ─── 8-page booklet ────────────────────────────────────────────────────────
  describe('8 pages', () => {
    it('returns 8 assignments (2 sheets × 4 positions)', () => {
      const result = calculateSaddleStitch(8);
      expect(result).toHaveLength(8);
    });

    it('sheet 0 back = [7, 0]', () => {
      const result = calculateSaddleStitch(8) as PageAssignment[];
      expect(sheetPages(result, 0, 'back')).toEqual([7, 0]);
    });

    it('sheet 0 front = [3, 4]', () => {
      const result = calculateSaddleStitch(8) as PageAssignment[];
      expect(sheetPages(result, 0, 'front')).toEqual([3, 4]);
    });

    it('sheet 1 back = [5, 2]', () => {
      const result = calculateSaddleStitch(8) as PageAssignment[];
      expect(sheetPages(result, 1, 'back')).toEqual([5, 2]);
    });

    it('sheet 1 front = [1, 6] (standard booklet: inner pages of innermost sheet)', () => {
      // Correct 8-page booklet layout:
      // Sheet 0 (outer): back=[7,0], front=[3,4]
      // Sheet 1 (inner): back=[5,2], front=[1,6]
      // Plan spec had [2,5] which was incorrect (duplicated pages 2 and 5)
      // Correct formula: innerFirst = N/2-1-2s, innerLast = N/2+2s
      const result = calculateSaddleStitch(8) as PageAssignment[];
      expect(sheetPages(result, 1, 'front')).toEqual([1, 6]);
    });

    it('all 8 source page indices appear exactly once', () => {
      const result = calculateSaddleStitch(8) as PageAssignment[];
      const indices = result
        .map((a) => a.sourcePageIndex)
        .filter((i): i is number => i !== null)
        .sort((a, b) => a - b);
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });
  });

  // ─── 12-page booklet ───────────────────────────────────────────────────────
  describe('12 pages', () => {
    it('returns 12 assignments (3 sheets × 4 positions)', () => {
      const result = calculateSaddleStitch(12);
      expect(result).toHaveLength(12);
    });

    it('all 12 source page indices appear exactly once', () => {
      const result = calculateSaddleStitch(12) as PageAssignment[];
      const indices = result
        .map((a) => a.sourcePageIndex)
        .filter((i): i is number => i !== null)
        .sort((a, b) => a - b);
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });
  });

  // ─── 16-page booklet ───────────────────────────────────────────────────────
  describe('16 pages', () => {
    it('returns 16 assignments (4 sheets × 4 positions)', () => {
      const result = calculateSaddleStitch(16);
      expect(result).toHaveLength(16);
    });

    it('all 16 source page indices appear exactly once', () => {
      const result = calculateSaddleStitch(16) as PageAssignment[];
      const indices = result
        .map((a) => a.sourcePageIndex)
        .filter((i): i is number => i !== null)
        .sort((a, b) => a - b);
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });
  });

  // ─── 20-page booklet ───────────────────────────────────────────────────────
  describe('20 pages', () => {
    it('returns 20 assignments (5 sheets × 4 positions)', () => {
      const result = calculateSaddleStitch(20);
      expect(result).toHaveLength(20);
    });

    it('all 20 source page indices appear exactly once', () => {
      const result = calculateSaddleStitch(20) as PageAssignment[];
      const indices = result
        .map((a) => a.sourcePageIndex)
        .filter((i): i is number => i !== null)
        .sort((a, b) => a - b);
      const expected = Array.from({ length: 20 }, (_, i) => i);
      expect(indices).toEqual(expected);
    });
  });

  // ─── 24-page booklet ───────────────────────────────────────────────────────
  describe('24 pages', () => {
    it('returns 24 assignments (6 sheets × 4 positions)', () => {
      const result = calculateSaddleStitch(24);
      expect(result).toHaveLength(24);
    });

    it('all 24 source page indices appear exactly once', () => {
      const result = calculateSaddleStitch(24) as PageAssignment[];
      const indices = result
        .map((a) => a.sourcePageIndex)
        .filter((i): i is number => i !== null)
        .sort((a, b) => a - b);
      const expected = Array.from({ length: 24 }, (_, i) => i);
      expect(indices).toEqual(expected);
    });
  });

  // ─── Not divisible by 4: returns blanks info ───────────────────────────────
  describe('pages not divisible by 4', () => {
    it('3 pages: returns { needsBlanks: true, blanksNeeded: 1 }', () => {
      const result = calculateSaddleStitch(3);
      expect(result).toEqual({ needsBlanks: true, blanksNeeded: 1 });
    });

    it('5 pages: returns { needsBlanks: true, blanksNeeded: 3 }', () => {
      const result = calculateSaddleStitch(5);
      expect(result).toEqual({ needsBlanks: true, blanksNeeded: 3 });
    });

    it('7 pages: returns { needsBlanks: true, blanksNeeded: 1 }', () => {
      const result = calculateSaddleStitch(7);
      expect(result).toEqual({ needsBlanks: true, blanksNeeded: 1 });
    });

    it('9 pages: returns { needsBlanks: true, blanksNeeded: 3 }', () => {
      const result = calculateSaddleStitch(9);
      expect(result).toEqual({ needsBlanks: true, blanksNeeded: 3 });
    });

    it('17 pages: returns { needsBlanks: true, blanksNeeded: 3 }', () => {
      const result = calculateSaddleStitch(17);
      expect(result).toEqual({ needsBlanks: true, blanksNeeded: 3 });
    });
  });

  // ─── addBlanks: pads with null entries ─────────────────────────────────────
  describe('addBlanks option', () => {
    it('3 pages with addBlanks=true: returns 4 assignments (1 null blank)', () => {
      const result = calculateSaddleStitch(3, true) as PageAssignment[];
      expect(result).toHaveLength(4);
    });

    it('3 pages with addBlanks=true: has exactly 1 null sourcePageIndex', () => {
      const result = calculateSaddleStitch(3, true) as PageAssignment[];
      const nullCount = result.filter((a) => a.sourcePageIndex === null).length;
      expect(nullCount).toBe(1);
    });

    it('5 pages with addBlanks=true: returns 8 assignments (3 null blanks)', () => {
      const result = calculateSaddleStitch(5, true) as PageAssignment[];
      expect(result).toHaveLength(8);
    });

    it('5 pages with addBlanks=true: has exactly 3 null sourcePageIndex entries', () => {
      const result = calculateSaddleStitch(5, true) as PageAssignment[];
      const nullCount = result.filter((a) => a.sourcePageIndex === null).length;
      expect(nullCount).toBe(3);
    });
  });

  // ─── PageAssignment shape ──────────────────────────────────────────────────
  describe('PageAssignment shape', () => {
    it('each assignment has sourcePageIndex, side, position, sheetIndex', () => {
      const result = calculateSaddleStitch(4) as PageAssignment[];
      for (const a of result) {
        expect(a).toHaveProperty('sourcePageIndex');
        expect(a).toHaveProperty('side');
        expect(a).toHaveProperty('position');
        expect(a).toHaveProperty('sheetIndex');
      }
    });

    it('side is "back" or "front"', () => {
      const result = calculateSaddleStitch(4) as PageAssignment[];
      for (const a of result) {
        expect(['back', 'front']).toContain(a.side);
      }
    });

    it('position is "left" or "right"', () => {
      const result = calculateSaddleStitch(4) as PageAssignment[];
      for (const a of result) {
        expect(['left', 'right']).toContain(a.position);
      }
    });
  });
});
