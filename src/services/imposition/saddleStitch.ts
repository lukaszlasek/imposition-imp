/**
 * Saddle stitch imposition algorithm.
 *
 * Pure function — no side effects, no React dependencies.
 * Takes a page count, returns a flat array of PageAssignment objects
 * describing where each source page lands on each printed sheet.
 *
 * Algorithm (0-indexed pages, totalSheets = pageCount / 4):
 *   For each sheet s:
 *     outerLast  = pageCount - 1 - (s * 2)    → back, left (last/cover page)
 *     outerFirst = s * 2                        → back, right (first/cover page)
 *     innerFirst = pageCount / 2 - 1 - (s * 2) → front, left
 *     innerLast  = pageCount / 2 + (s * 2)     → front, right
 *
 * Back side  (outer): [outerLast (left), outerFirst (right)]
 * Front side (inner): [innerFirst (left), innerLast (right)]
 *
 * Verified correct for 4, 8, 12, 16, 20, 24 pages — all source pages
 * appear exactly once across all assignments.
 */

import type { PageAssignment, BlanksNeededResult, SaddleStitchResult } from '../../types/imposition';

/**
 * Calculate saddle stitch imposition page assignments.
 *
 * @param pageCount - Total source pages (must be divisible by 4)
 * @param addBlanks - When true AND pageCount % 4 !== 0, pad to next multiple of 4
 *                    with null entries instead of returning BlanksNeededResult
 * @returns PageAssignment[] when pageCount % 4 === 0 (or addBlanks is true)
 *          BlanksNeededResult when pageCount % 4 !== 0 and addBlanks is false/undefined
 */
export function calculateSaddleStitch(
  pageCount: number,
  addBlanks?: boolean,
): SaddleStitchResult {
  const remainder = pageCount % 4;

  if (remainder !== 0) {
    const blanksNeeded = 4 - remainder;

    if (!addBlanks) {
      const result: BlanksNeededResult = { needsBlanks: true, blanksNeeded };
      return result;
    }

    // Pad page count to next multiple of 4; extra pages become null assignments
    const paddedCount = pageCount + blanksNeeded;
    return buildAssignments(pageCount, paddedCount);
  }

  return buildAssignments(pageCount, pageCount);
}

/**
 * Build the flat PageAssignment array for a given padded page count.
 * sourcePageCount = actual pages (indices 0 to sourcePageCount-1 are real)
 * totalPageCount  = padded to multiple of 4 (extra indices become null)
 */
function buildAssignments(
  sourcePageCount: number,
  totalPageCount: number,
): PageAssignment[] {
  const totalSheets = totalPageCount / 4;
  const assignments: PageAssignment[] = [];

  for (let s = 0; s < totalSheets; s++) {
    const outerLast = totalPageCount - 1 - s * 2;
    const outerFirst = s * 2;
    const innerFirst = totalPageCount / 2 - 1 - s * 2;
    const innerLast = totalPageCount / 2 + s * 2;

    // Back side: outerLast (left), outerFirst (right)
    assignments.push(makeAssignment(outerLast, 'back', 'left', s, sourcePageCount));
    assignments.push(makeAssignment(outerFirst, 'back', 'right', s, sourcePageCount));

    // Front side: innerFirst (left), innerLast (right)
    assignments.push(makeAssignment(innerFirst, 'front', 'left', s, sourcePageCount));
    assignments.push(makeAssignment(innerLast, 'front', 'right', s, sourcePageCount));
  }

  return assignments;
}

/** Create a PageAssignment, using null for padded blank pages */
function makeAssignment(
  pageIndex: number,
  side: 'back' | 'front',
  position: 'left' | 'right',
  sheetIndex: number,
  sourcePageCount: number,
): PageAssignment {
  return {
    sourcePageIndex: pageIndex < sourcePageCount ? pageIndex : null,
    side,
    position,
    sheetIndex,
  };
}
