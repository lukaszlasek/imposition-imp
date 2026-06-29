/**
 * File and input validation utilities.
 */

import type { FileSizeValidation, DivisibilityResult } from '../types/imposition';

/** 50MB in bytes */
const WARN_THRESHOLD_BYTES = 52428800; // 50 * 1024 * 1024

/** 100MB in bytes */
const REJECT_THRESHOLD_BYTES = 104857600; // 100 * 1024 * 1024

/**
 * Validate uploaded file size.
 *
 * - < 50MB → 'ok'
 * - >= 50MB and < 100MB → 'warn' (will be slow)
 * - >= 100MB → 'reject' (browser memory risk)
 */
export function validateFileSize(bytes: number): FileSizeValidation {
  if (bytes >= REJECT_THRESHOLD_BYTES) {
    return 'reject';
  }
  if (bytes >= WARN_THRESHOLD_BYTES) {
    return 'warn';
  }
  return 'ok';
}

/**
 * Check whether a page count is divisible by 4 (saddle stitch requirement).
 * Returns { divisible, blanksNeeded } — blanksNeeded is 0 when divisible.
 */
export function checkPageCountDivisibility(pageCount: number): DivisibilityResult {
  const remainder = pageCount % 4;
  if (remainder === 0) {
    return { divisible: true, blanksNeeded: 0 };
  }
  return { divisible: false, blanksNeeded: 4 - remainder };
}
