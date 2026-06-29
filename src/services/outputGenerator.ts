/**
 * Output generator service using pdf-lib.
 * Produces 2-up imposed PDFs from a source PDF + imposition configuration.
 *
 * PITFALL: Never accept PDFDocument as parameter — load fresh from bytes each time.
 * PITFALL: PDF Y-axis is bottom-left origin; centering: y = (sheetHeight - scaledHeight) / 2
 * PITFALL: Blank page slots (sourcePageIndex === null) produce white space — correct for saddle stitch blanks.
 */

import { PDFDocument } from 'pdf-lib'
import { calculateSaddleStitch } from './imposition/saddleStitch'
import { calculateMultiSignature } from './imposition/multiSignature'
import { mmToPoints, PAPER_SIZES } from '../utils/coordinates'
import type { ImpositionConfig } from '../types/imposition'

/**
 * Generate an imposed PDF with 2-up landscape layout.
 * Supports saddle stitch (single signature) and multi-signature binding modes.
 * Applies duplex calibration offsets (PRT-02) and creep compensation (PRT-03).
 *
 * @param sourcePDFBytes - Raw bytes of the source PDF (never a PDFDocument object)
 * @param config         - Imposition configuration (paper size, binding mode, margins, offsets)
 * @param addBlanks      - Whether to pad page count to next multiple of 4 with blank pages
 * @returns Promise<Uint8Array> — raw bytes of the imposed output PDF
 * @throws Error if page count is not divisible by 4 and addBlanks is false
 */
export async function generateImposedPDF(
  sourcePDFBytes: Uint8Array,
  config: ImpositionConfig,
  addBlanks: boolean,
): Promise<Uint8Array> {
  // Load source PDF fresh each time (never store PDFDocument in state — PITFALL #1)
  const sourcePDF = await PDFDocument.load(sourcePDFBytes)
  const sourcePageCount = sourcePDF.getPageCount()

  // Choose imposition algorithm by binding mode (ENG-05)
  const safeSheetsPerSig = Math.max(1, config.sheetsPerSignature ?? 1)
  const impositionResult =
    config.bindingMode === 'multi-signature'
      ? calculateMultiSignature(sourcePageCount, safeSheetsPerSig, addBlanks)
      : calculateSaddleStitch(sourcePageCount, addBlanks)

  // If addBlanks is false and pages are not divisible by 4, throw
  if ('needsBlanks' in impositionResult) {
    throw new Error(
      `Page count ${sourcePageCount} is not divisible by 4. ` +
        `Need ${impositionResult.blanksNeeded} blank page(s). ` +
        `Set addBlanks to true to pad automatically.`,
    )
  }

  const assignments = impositionResult

  // Output page dimensions: paper size in landscape for 2-up layout
  // Landscape: width = paper height (longer dimension), height = paper width (shorter dimension)
  const paperSpec = PAPER_SIZES[config.paperSize]
  const sheetWidthPt  = mmToPoints(paperSpec.heightMm) // landscape: longer dimension is width
  const sheetHeightPt = mmToPoints(paperSpec.widthMm)  // landscape: shorter dimension is height
  const halfWidthPt   = sheetWidthPt / 2
  const bindingMarginMm = config.bindingMarginMm ?? 5
  const gutterPt = mmToPoints(bindingMarginMm)

  // Duplex calibration offsets (PRT-02): applied to front-side pages (second print pass)
  const duplexXPt = mmToPoints(config.duplexOffsetXMm ?? 0)
  const duplexYPt = mmToPoints(config.duplexOffsetYMm ?? 0)

  // Creep compensation (PRT-03)
  // For saddle stitch: within-sig index = sheetIndex (one big signature)
  // For multi-signature: within-sig index = sheetIndex % sheetsPerSig
  const creepMm = config.creepMm ?? 0
  const totalSheets = assignments.length > 0
    ? Math.max(...assignments.map((a) => a.sheetIndex)) + 1
    : 0
  const sheetsPerSigForCreep =
    config.bindingMode === 'multi-signature'
      ? safeSheetsPerSig
      : totalSheets // saddle stitch: all sheets are in one signature

  // Create output PDF
  const outputPDF = await PDFDocument.create()

  // Group assignments by (sheetIndex, side) — each pair = one output page
  const sheetSideMap = new Map<string, (typeof assignments)[0][]>()
  for (const assignment of assignments) {
    const key = `${assignment.sheetIndex}-${assignment.side}`
    if (!sheetSideMap.has(key)) sheetSideMap.set(key, [])
    sheetSideMap.get(key)!.push(assignment)
  }

  // Output pages: for each sheet, back then front (duplex printing order)
  for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
    for (const side of ['back', 'front'] as const) {
      const key = `${sheetIdx}-${side}`
      const sheetAssignments = sheetSideMap.get(key)
      if (!sheetAssignments) continue

      const outputPage = outputPDF.addPage([sheetWidthPt, sheetHeightPt])

      // Duplex offset: shift all content on front-side pages to compensate for
      // printer back-side misalignment (PRT-02). User-measured in mm.
      const pageDuplexXPt = side === 'front' ? duplexXPt : 0
      const pageDuplexYPt = side === 'front' ? duplexYPt : 0

      for (const assignment of sheetAssignments) {
        // Blank page slot — leave white space (correct for saddle stitch blanks)
        if (assignment.sourcePageIndex === null) continue

        // X offset for left vs right position on the landscape sheet
        const xOffset =
          assignment.position === 'left'
            ? gutterPt / 2                  // left half: indent by half gutter from left edge
            : halfWidthPt + gutterPt / 2    // right half: start at midpoint + half gutter

        // Creep compensation (PRT-03): inner sheets need content shifted toward spine.
        // withinSigIdx 0 = outermost (no shift), max = innermost (full creep).
        const withinSigIdx =
          sheetsPerSigForCreep > 1
            ? sheetIdx % sheetsPerSigForCreep
            : 0
        const maxWithinSig = sheetsPerSigForCreep - 1
        const creepPt =
          creepMm > 0 && maxWithinSig > 0
            ? mmToPoints((withinSigIdx / maxWithinSig) * creepMm)
            : 0
        // Left pages: shift right toward spine (+x); right pages: shift left toward spine (-x)
        const creepXPt = assignment.position === 'left' ? creepPt : -creepPt

        // Embed source page into output PDF
        const [embeddedPage] = await outputPDF.embedPages([
          sourcePDF.getPage(assignment.sourcePageIndex),
        ])

        // Get source page dimensions for scaling
        const sourcePage = sourcePDF.getPage(assignment.sourcePageIndex)
        const { width: srcW, height: srcH } = sourcePage.getSize()

        // Scale source page to fit half-sheet, preserving aspect ratio
        const availableWidth  = halfWidthPt - gutterPt
        const availableHeight = sheetHeightPt
        const scaleX = availableWidth  / srcW
        const scaleY = availableHeight / srcH
        const scale  = Math.min(scaleX, scaleY)

        // Draw page on output sheet (PDF Y-axis: bottom-left origin — PITFALL #2)
        outputPage.drawPage(embeddedPage, {
          x:      xOffset + creepXPt + pageDuplexXPt,
          y:      (sheetHeightPt - srcH * scale) / 2 + pageDuplexYPt,
          width:  srcW * scale,
          height: srcH * scale,
        })
      }
    }
  }

  return outputPDF.save()
}
