/**
 * TypeScript contracts for PDF source file metadata.
 * Used by PDF parser service and imposition engine.
 */

/** Page dimensions in PDF points (1 point = 1/72 inch) */
export interface PageDimensions {
  widthPt: number;
  heightPt: number;
}

/** Metadata extracted from a source PDF file */
export interface PDFMetadata {
  pageCount: number;
  dimensions: PageDimensions; // First page dimensions, assumed uniform
  fileSizeBytes: number;
}

/** Represents the uploaded source file before parsing */
export interface SourceFile {
  name: string;
  bytes: Uint8Array;
  fileSizeBytes: number;
}
