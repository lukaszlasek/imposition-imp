import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { generateCalibrationPDF } from './calibrationGenerator';

describe('generateCalibrationPDF', () => {
  it('returns a Uint8Array (not null/undefined)', async () => {
    const result = await generateCalibrationPDF('A4');
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('returns valid PDF bytes that can be loaded by pdf-lib (A4)', async () => {
    const bytes = await generateCalibrationPDF('A4');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(2);
  });

  it('returns valid PDF bytes that can be loaded by pdf-lib (Letter)', async () => {
    const bytes = await generateCalibrationPDF('Letter');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(2);
  });

  it('returns valid PDF bytes that can be loaded by pdf-lib (A3)', async () => {
    const bytes = await generateCalibrationPDF('A3');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(2);
  });

  it('produces exactly 2 pages for every supported paper size', async () => {
    const sizes = ['A4', 'A3', 'Letter', 'Legal'] as const;
    for (const size of sizes) {
      const bytes = await generateCalibrationPDF(size);
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount()).toBe(2);
    }
  });
});
