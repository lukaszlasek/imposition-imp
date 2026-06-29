/**
 * Shared TypeScript contracts for all imposition operations.
 * Plans 03 and 04 import from this file.
 */

/** Standard paper sizes supported by the imposition engine */
export type PaperSizeName = 'A4' | 'A3' | 'Letter' | 'Legal';

/** Paper size dimensions in mm and PDF points */
export interface PaperSize {
  name: PaperSizeName;
  widthMm: number;
  heightMm: number;
  widthPt: number;
  heightPt: number;
}

/** Binding style for imposition */
export type BindingMode = 'saddle-stitch' | 'multi-signature';

/** Configuration passed to the imposition engine */
export interface ImpositionConfig {
  pageCount: number;
  bindingMode: BindingMode;
  paperSize: PaperSizeName;
  sheetsPerSignature?: number;
  addBlanks?: boolean;
  bindingMarginMm?: number;    // Gutter width in mm (default: 5mm)
  duplexOffsetXMm?: number;   // PRT-02: horizontal back-side shift in mm (default: 0)
  duplexOffsetYMm?: number;   // PRT-02: vertical back-side shift in mm (default: 0)
  creepMm?: number;           // PRT-03: total creep at innermost sheet in mm (default: 0)
}

/**
 * A single page's placement on a physical printed sheet.
 * sourcePageIndex is 0-based; null means a blank page.
 */
export interface PageAssignment {
  sourcePageIndex: number | null;
  side: 'back' | 'front';
  position: 'left' | 'right';
  sheetIndex: number;
}

/** Layout description for a single printed sheet */
export interface SignatureLayout {
  sheetIndex: number;
  back: [PageAssignment, PageAssignment]; // [left, right]
  front: [PageAssignment, PageAssignment]; // [left, right]
}

/** Result when page count is not divisible by 4 */
export interface BlanksNeededResult {
  needsBlanks: true;
  blanksNeeded: number;
}

/** Returned by calculateSaddleStitch when pages are not divisible by 4 */
export type SaddleStitchResult = PageAssignment[] | BlanksNeededResult;

/** Result of file size validation */
export type FileSizeValidation = 'ok' | 'warn' | 'reject';

/** Result of page count divisibility check */
export interface DivisibilityResult {
  divisible: boolean;
  blanksNeeded: number;
}
