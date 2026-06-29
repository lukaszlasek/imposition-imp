/**
 * Coordinate conversion utilities: mm <-> PDF points
 * 1 inch = 25.4 mm, 1 inch = 72 PDF points
 * Therefore: 1 mm = 72 / 25.4 = 2.834645669 points
 */

import type { PaperSize, PaperSizeName } from '../types/imposition';

/** Conversion constant: PDF points per millimeter (72 / 25.4) */
export const MM_TO_POINTS = 2.834645669;

/**
 * Convert millimeters to PDF points.
 * Result is rounded to 3 decimal places.
 */
export function mmToPoints(mm: number): number {
  return Math.round(mm * MM_TO_POINTS * 1000) / 1000;
}

/**
 * Convert PDF points to millimeters.
 * Result is rounded to 3 decimal places.
 */
export function pointsToMm(points: number): number {
  return Math.round((points / MM_TO_POINTS) * 1000) / 1000;
}

/** Standard paper sizes with dimensions in mm and PDF points */
export const PAPER_SIZES: Record<PaperSizeName, PaperSize> = {
  A4: {
    name: 'A4',
    widthMm: 210,
    heightMm: 297,
    widthPt: mmToPoints(210),
    heightPt: mmToPoints(297),
  },
  A3: {
    name: 'A3',
    widthMm: 297,
    heightMm: 420,
    widthPt: mmToPoints(297),
    heightPt: mmToPoints(420),
  },
  Letter: {
    name: 'Letter',
    widthMm: 215.9,
    heightMm: 279.4,
    widthPt: 612,  // Standard PDF points (exact)
    heightPt: 792, // Standard PDF points (exact)
  },
  Legal: {
    name: 'Legal',
    widthMm: 215.9,
    heightMm: 355.6,
    widthPt: 612,  // Standard PDF points (exact)
    heightPt: 1008, // Standard PDF points (exact)
  },
};
