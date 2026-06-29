/**
 * Duplex calibration PDF generator.
 *
 * Produces a 2-page PDF with crosshairs centered on each page.
 * The user prints this duplex, then measures the offset between
 * the front and back crosshairs to calibrate duplex alignment.
 *
 * Page 1: FRONT SIDE — reference crosshair
 * Page 2: BACK SIDE — matching crosshair; offset reveals printer misalignment
 */

import { PDFDocument, rgb } from 'pdf-lib';
import { mmToPoints, PAPER_SIZES } from '../utils/coordinates';
import type { PaperSizeName } from '../types/imposition';

/**
 * Generate a 2-page duplex calibration PDF for the given paper size.
 *
 * @param paperSize - The target paper size (A4, A3, Letter, Legal)
 * @returns Promise<Uint8Array> — raw PDF bytes ready for download
 */
export async function generateCalibrationPDF(paperSize: PaperSizeName): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const spec = PAPER_SIZES[paperSize];
  const w = mmToPoints(spec.widthMm);
  const h = mmToPoints(spec.heightMm);
  const cx = w / 2;
  const cy = h / 2;
  const arm = mmToPoints(50); // 50mm arms — large enough for ruler measurement

  const drawCrosshair = (page: ReturnType<typeof pdf.addPage>) => {
    // Horizontal arm
    page.drawLine({
      start: { x: cx - arm, y: cy },
      end: { x: cx + arm, y: cy },
      thickness: 2,
      color: rgb(0, 0, 0),
    });
    // Vertical arm
    page.drawLine({
      start: { x: cx, y: cy - arm },
      end: { x: cx, y: cy + arm },
      thickness: 2,
      color: rgb(0, 0, 0),
    });
    // Center circle for precise alignment target
    page.drawCircle({
      x: cx,
      y: cy,
      size: mmToPoints(2),
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
  };

  // Page 1 — Front side
  const p1 = pdf.addPage([w, h]);
  p1.drawText('IMP — DUPLEX CALIBRATION — FRONT SIDE', {
    x: 40,
    y: h - 50,
    size: 14,
    color: rgb(0, 0, 0),
  });
  p1.drawText(
    'Print this sheet duplex. Then measure the distance (mm) between crosshair centers on front and back.',
    { x: 40, y: h - 75, size: 9, color: rgb(0, 0, 0) },
  );
  drawCrosshair(p1);

  // Page 2 — Back side
  const p2 = pdf.addPage([w, h]);
  p2.drawText('IMP — DUPLEX CALIBRATION — BACK SIDE', {
    x: 40,
    y: h - 50,
    size: 14,
    color: rgb(0, 0, 0),
  });
  p2.drawText(
    'If back crosshair is shifted RIGHT of front: enter positive X. If shifted UP: enter positive Y.',
    { x: 40, y: h - 75, size: 9, color: rgb(0, 0, 0) },
  );
  drawCrosshair(p2);

  return pdf.save();
}
