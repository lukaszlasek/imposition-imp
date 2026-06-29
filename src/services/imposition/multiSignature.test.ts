import { describe, it, expect } from 'vitest';
import { calculateMultiSignature } from './multiSignature';
import type { PageAssignment, BlanksNeededResult } from '../../types/imposition';

describe('calculateMultiSignature', () => {
  // ─── 8-page PDF, 1 sheet/sig → 2 signatures ────────────────────────────────
  // pagesPerSig = 1 * 4 = 4 → 2 signatures, each with 1 sheet = 2 total sheets
  describe('8 pages, 1 sheet/sig → 2 signatures', () => {
    it('returns 8 assignments (2 sigs × 1 sheet × 4 positions)', () => {
      const result = calculateMultiSignature(8, 1);
      expect(result).toHaveLength(8);
    });

    it('produces 2 total sheets (globally unique sheet indices 0–1)', () => {
      const result = calculateMultiSignature(8, 1) as PageAssignment[];
      const sheetIndices = [...new Set(result.map((a) => a.sheetIndex))].sort((a, b) => a - b);
      expect(sheetIndices).toEqual([0, 1]);
    });

    it('all 8 source page indices appear exactly once', () => {
      const result = calculateMultiSignature(8, 1) as PageAssignment[];
      const indices = result
        .map((a) => a.sourcePageIndex)
        .filter((i): i is number => i !== null)
        .sort((a, b) => a - b);
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });
  });

  // ─── 32-page PDF, 8 sheets/sig → 1 signature ───────────────────────────────
  describe('32 pages, 8 sheets/sig → 1 signature', () => {
    it('returns 32 assignments (1 sig × 8 sheets × 4 positions)', () => {
      const result = calculateMultiSignature(32, 8);
      expect(result).toHaveLength(32);
    });

    it('produces 8 total sheets (globally unique sheet indices 0–7)', () => {
      const result = calculateMultiSignature(32, 8) as PageAssignment[];
      const sheetIndices = [...new Set(result.map((a) => a.sheetIndex))].sort((a, b) => a - b);
      expect(sheetIndices).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });

    it('all 32 source page indices appear exactly once', () => {
      const result = calculateMultiSignature(32, 8) as PageAssignment[];
      const indices = result
        .map((a) => a.sourcePageIndex)
        .filter((i): i is number => i !== null)
        .sort((a, b) => a - b);
      expect(indices).toEqual(Array.from({ length: 32 }, (_, i) => i));
    });
  });

  // ─── 36-page PDF, 8 sheets/sig → partial last signature ────────────────────
  describe('36 pages, 8 sheets/sig → 1 full sig + 1 partial sig', () => {
    it('returns 36 assignments (8+1 sheets × 4 positions)', () => {
      const result = calculateMultiSignature(36, 8);
      expect(result).toHaveLength(36);
    });

    it('produces 9 total sheets', () => {
      const result = calculateMultiSignature(36, 8) as PageAssignment[];
      const sheetIndices = [...new Set(result.map((a) => a.sheetIndex))];
      expect(sheetIndices).toHaveLength(9);
    });

    it('sheet indices are globally unique across signatures (0–8)', () => {
      const result = calculateMultiSignature(36, 8) as PageAssignment[];
      const sheetIndices = [...new Set(result.map((a) => a.sheetIndex))].sort((a, b) => a - b);
      expect(sheetIndices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('all 36 source page indices appear exactly once', () => {
      const result = calculateMultiSignature(36, 8) as PageAssignment[];
      const indices = result
        .map((a) => a.sourcePageIndex)
        .filter((i): i is number => i !== null)
        .sort((a, b) => a - b);
      expect(indices).toEqual(Array.from({ length: 36 }, (_, i) => i));
    });
  });

  // ─── Non-divisible: 5-page PDF, addBlanks=false ────────────────────────────
  describe('5 pages, addBlanks not set → returns BlanksNeededResult', () => {
    it('returns BlanksNeededResult with needsBlanks=true', () => {
      const result = calculateMultiSignature(5, 4);
      expect((result as BlanksNeededResult).needsBlanks).toBe(true);
    });

    it('returns blanksNeeded=3', () => {
      const result = calculateMultiSignature(5, 4);
      expect((result as BlanksNeededResult).blanksNeeded).toBe(3);
    });
  });

  // ─── Non-divisible: 5-page PDF, addBlanks=true ─────────────────────────────
  describe('5 pages, addBlanks=true → pads to 8 pages', () => {
    it('returns PageAssignment[] of length 8', () => {
      const result = calculateMultiSignature(5, 4, true) as PageAssignment[];
      expect(result).toHaveLength(8);
    });

    it('has exactly 3 null sourcePageIndex entries (blank pages)', () => {
      const result = calculateMultiSignature(5, 4, true) as PageAssignment[];
      const nullCount = result.filter((a) => a.sourcePageIndex === null).length;
      expect(nullCount).toBe(3);
    });

    it('source page indices 0–4 each appear exactly once', () => {
      const result = calculateMultiSignature(5, 4, true) as PageAssignment[];
      const nonNull = result
        .map((a) => a.sourcePageIndex)
        .filter((i): i is number => i !== null)
        .sort((a, b) => a - b);
      expect(nonNull).toEqual([0, 1, 2, 3, 4]);
    });
  });

  // ─── No duplicate or missing source page indices ────────────────────────────
  describe('source page index integrity', () => {
    it('12-page, 1 sheet/sig: all indices appear exactly once (no duplicates)', () => {
      const result = calculateMultiSignature(12, 1) as PageAssignment[];
      const indices = result
        .map((a) => a.sourcePageIndex)
        .filter((i): i is number => i !== null)
        .sort((a, b) => a - b);
      expect(indices).toEqual(Array.from({ length: 12 }, (_, i) => i));
    });
  });

  // ─── PageAssignment shape ───────────────────────────────────────────────────
  describe('PageAssignment shape', () => {
    it('each assignment has side "back" or "front"', () => {
      const result = calculateMultiSignature(8, 2) as PageAssignment[];
      for (const a of result) {
        expect(['back', 'front']).toContain(a.side);
      }
    });

    it('each assignment has position "left" or "right"', () => {
      const result = calculateMultiSignature(8, 2) as PageAssignment[];
      for (const a of result) {
        expect(['left', 'right']).toContain(a.position);
      }
    });

    it('sheet indices are globally unique integers starting at 0', () => {
      const result = calculateMultiSignature(16, 2) as PageAssignment[];
      const sheetIndices = [...new Set(result.map((a) => a.sheetIndex))].sort((a, b) => a - b);
      // 16 pages / 4 = 4 sheets
      expect(sheetIndices).toEqual([0, 1, 2, 3]);
    });
  });
});
