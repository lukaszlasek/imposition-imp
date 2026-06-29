/**
 * Multi-signature imposition algorithm.
 *
 * Distributes source pages across multiple folded signatures.
 * Each signature is an independent saddle-stitch unit containing
 * sheetsPerSignature sheets (= sheetsPerSignature * 4 pages when folded).
 *
 * Page distribution (0-indexed):
 *   Signature 0 → pages 0 .. pagesPerSig-1
 *   Signature 1 → pages pagesPerSig .. 2*pagesPerSig-1
 *   …
 *   Last signature → remaining pages (may be < pagesPerSig, always a multiple of 4)
 *
 * Within each signature, standard saddle-stitch imposition applies.
 * Sheet indices are globally unique across all signatures; the output
 * generator treats them as a flat ordered list of physical sheets
 * (back then front per sheet, signature by signature).
 *
 * Divisibility requirement: pageCount must be divisible by 4.
 * Pages are NOT required to divide evenly by pagesPerSig — the last
 * signature may have fewer sheets than sheetsPerSignature.
 */

import type { PageAssignment, BlanksNeededResult, SaddleStitchResult } from '../../types/imposition';

/**
 * Calculate multi-signature imposition page assignments.
 *
 * @param pageCount         - Total source pages (will be padded to multiple of 4 if addBlanks is true)
 * @param sheetsPerSignature - Number of sheets per folded signature (min 1)
 * @param addBlanks         - When true AND pageCount % 4 !== 0, pad with null entries
 * @returns PageAssignment[] when pages are (or become) divisible by 4;
 *          BlanksNeededResult otherwise
 */
export function calculateMultiSignature(
  pageCount: number,
  sheetsPerSignature: number,
  addBlanks?: boolean,
): SaddleStitchResult {
  const remainder = pageCount % 4;
  const realPageCount = pageCount; // original count; indices ≥ this become null

  if (remainder !== 0) {
    const blanksNeeded = 4 - remainder;
    if (!addBlanks) {
      const result: BlanksNeededResult = { needsBlanks: true, blanksNeeded };
      return result;
    }
    pageCount = pageCount + blanksNeeded; // pad to next multiple of 4
  }

  // pagesPerSig is always a multiple of 4
  const safeSheetsPerSig = Math.max(1, sheetsPerSignature);
  const pagesPerSig = safeSheetsPerSig * 4;

  const assignments: PageAssignment[] = [];
  let globalSheetOffset = 0;

  for (let sigStart = 0; sigStart < pageCount; sigStart += pagesPerSig) {
    const sigEnd = Math.min(sigStart + pagesPerSig, pageCount);
    // sigPageCount is always a multiple of 4:
    //   - pageCount is a multiple of 4
    //   - sigStart is always k * pagesPerSig, also a multiple of 4
    //   - therefore sigEnd - sigStart is a multiple of 4
    const sigPageCount = sigEnd - sigStart;
    const sigSheets = sigPageCount / 4;

    for (let s = 0; s < sigSheets; s++) {
      const outerLast  = sigPageCount - 1 - s * 2;
      const outerFirst = s * 2;
      const innerFirst = sigPageCount / 2 - 1 - s * 2;
      const innerLast  = sigPageCount / 2 + s * 2;

      // Back side (outer): outerLast (left), outerFirst (right)
      assignments.push(makeAssignment(sigStart + outerLast,  'back',  'left',  globalSheetOffset + s, realPageCount));
      assignments.push(makeAssignment(sigStart + outerFirst, 'back',  'right', globalSheetOffset + s, realPageCount));

      // Front side (inner): innerFirst (left), innerLast (right)
      assignments.push(makeAssignment(sigStart + innerFirst, 'front', 'left',  globalSheetOffset + s, realPageCount));
      assignments.push(makeAssignment(sigStart + innerLast,  'front', 'right', globalSheetOffset + s, realPageCount));
    }

    globalSheetOffset += sigSheets;
  }

  return assignments;
}

/** Create a PageAssignment; indices ≥ realPageCount are blank (padded) pages */
function makeAssignment(
  globalPageIndex: number,
  side: 'back' | 'front',
  position: 'left' | 'right',
  sheetIndex: number,
  realPageCount: number,
): PageAssignment {
  return {
    sourcePageIndex: globalPageIndex < realPageCount ? globalPageIndex : null,
    side,
    position,
    sheetIndex,
  };
}
