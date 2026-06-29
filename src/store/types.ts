/**
 * Zustand store state shape for the imposition app.
 * Referenced by components in Plan 04.
 */

import type { PDFMetadata } from '../types/pdf'
import type { ImpositionConfig } from '../types/imposition'
import type { BlanksNeededResult } from '../types/imposition'

/** Current step in the imposition workflow */
export type AppStep = 'upload' | 'settings' | 'composing' | 'done' | 'error'

export interface ImpositionState {
  // Source file (bytes kept for re-processing; PDFDocument NOT stored — mutable object)
  sourceFileBytes: Uint8Array | null
  sourceFileName: string | null
  sourceMetadata: PDFMetadata | null
  sourceWarning: 'large-file' | null

  // Configuration (paperSize and bindingMode from ImpositionConfig)
  config: Omit<ImpositionConfig, 'pageCount'>

  // Page count validation
  pageCountIssue: BlanksNeededResult | null
  addBlanksChoice: boolean | null // null = not yet decided

  // UI state
  step: AppStep
  error: string | null
  isProcessing: boolean

  // Output
  imposedPDFBytes: Uint8Array | null

  // Actions
  setSourceFile: (
    bytes: Uint8Array,
    fileName: string,
    metadata: PDFMetadata,
    warning?: 'large-file',
  ) => void
  setPageCountIssue: (issue: BlanksNeededResult | null) => void
  setAddBlanksChoice: (choice: boolean) => void
  updateConfig: (partial: Partial<Omit<ImpositionConfig, 'pageCount'>>) => void
  setStep: (step: AppStep) => void
  setError: (error: string | null) => void
  setIsProcessing: (v: boolean) => void
  setImposedPDF: (bytes: Uint8Array) => void
  reset: () => void
  hydrateCalibration: () => void
  persistCalibration: (x: number, y: number) => void
}
