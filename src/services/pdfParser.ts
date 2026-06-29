/**
 * PDF parser service using pdf-lib.
 * Extracts metadata (page count, dimensions) from uploaded PDF files.
 * Uses pdf-lib for both INPUT parsing and OUTPUT generation — no worker needed,
 * works correctly from file:// in single-file builds.
 */

import { PDFDocument } from 'pdf-lib'
import type { PDFMetadata, SourceFile } from '../types/pdf'

export interface PDFParseResult {
  metadata: PDFMetadata
  warning?: 'large-file' // present if file > 50MB
}

/**
 * Load and parse a PDF file, extracting metadata.
 *
 * @param file - The source file to parse (bytes + metadata)
 * @returns PDFParseResult with metadata and optional large-file warning
 * @throws Error if file is >= 100MB (not supported)
 */
export async function loadPDF(file: SourceFile): Promise<PDFParseResult> {
  // File size validation (IMP-03)
  const MB_50 = 52428800
  const MB_100 = 104857600

  if (file.fileSizeBytes >= MB_100) {
    throw new Error(
      `File "${file.name}" is ${(file.fileSizeBytes / 1048576).toFixed(1)}MB. ` +
        `Files over 100MB are not supported. Please use a smaller PDF.`,
    )
  }

  // ignoreEncryption: deliberate — lets users impose their own password/permission-
  // protected PDFs. Safe here because all processing is local (no server, no exfiltration);
  // the document never leaves the user's browser.
  const pdfDoc = await PDFDocument.load(file.bytes, { ignoreEncryption: true })

  const pageCount = pdfDoc.getPageCount()
  const firstPage = pdfDoc.getPage(0)
  const { width, height } = firstPage.getSize()

  const metadata: PDFMetadata = {
    pageCount,
    dimensions: {
      widthPt: width,
      heightPt: height,
    },
    fileSizeBytes: file.fileSizeBytes,
  }

  const result: PDFParseResult = { metadata }
  if (file.fileSizeBytes >= MB_50) {
    result.warning = 'large-file'
  }

  return result
}
