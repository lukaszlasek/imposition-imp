/**
 * Zustand store for all imposition app state.
 * Single source of truth: file bytes, parsed metadata, config, UI step, output bytes.
 *
 * PITFALL: Do NOT store PDFDocument objects here — they are mutable and not serializable.
 * Store bytes only; reload PDFDocument per operation in the service layer.
 */

import { create } from 'zustand'
import type { ImpositionState } from './types'

const DEFAULT_CONFIG = {
  bindingMode: 'saddle-stitch' as const,
  paperSize: 'A4' as const,
  sheetsPerSignature: 4,
  addBlanks: false,
  bindingMarginMm: 5,
  duplexOffsetXMm: 0,
  duplexOffsetYMm: 0,
  creepMm: 0,
}

export const useImpositionStore = create<ImpositionState>((set) => ({
  sourceFileBytes: null,
  sourceFileName: null,
  sourceMetadata: null,
  sourceWarning: null,
  config: DEFAULT_CONFIG,
  pageCountIssue: null,
  addBlanksChoice: null,
  step: 'upload',
  error: null,
  isProcessing: false,
  imposedPDFBytes: null,

  setSourceFile: (bytes, fileName, metadata, warning) =>
    set({
      sourceFileBytes: bytes,
      sourceFileName: fileName,
      sourceMetadata: metadata,
      sourceWarning: warning ?? null,
      step: 'settings',
      error: null,
    }),

  setPageCountIssue: (issue) => set({ pageCountIssue: issue }),

  setAddBlanksChoice: (choice) => set({ addBlanksChoice: choice }),

  updateConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),

  setStep: (step) => set({ step }),

  setError: (error) => set({ error, step: 'error' }),

  setIsProcessing: (v) => set({ isProcessing: v }),

  setImposedPDF: (bytes) => set({ imposedPDFBytes: bytes, step: 'done' }),

  reset: () =>
    set({
      sourceFileBytes: null,
      sourceFileName: null,
      sourceMetadata: null,
      sourceWarning: null,
      config: DEFAULT_CONFIG,
      pageCountIssue: null,
      addBlanksChoice: null,
      step: 'upload',
      error: null,
      isProcessing: false,
      imposedPDFBytes: null,
    }),

  hydrateCalibration: () => {
    try {
      const stored = localStorage.getItem('imp-calibration')
      if (stored) {
        const cal = JSON.parse(stored) as { duplexOffsetXMm?: number; duplexOffsetYMm?: number }
        set((state) => ({
          config: {
            ...state.config,
            duplexOffsetXMm: typeof cal.duplexOffsetXMm === 'number' ? cal.duplexOffsetXMm : state.config.duplexOffsetXMm,
            duplexOffsetYMm: typeof cal.duplexOffsetYMm === 'number' ? cal.duplexOffsetYMm : state.config.duplexOffsetYMm,
          }
        }))
      }
    } catch (e) {
      // localStorage unavailable (private browsing) — use defaults silently
      console.warn('[imp] localStorage unavailable; calibration defaults used', e)
    }
  },

  persistCalibration: (xMm: number, yMm: number) => {
    try {
      localStorage.setItem('imp-calibration', JSON.stringify({ duplexOffsetXMm: xMm, duplexOffsetYMm: yMm }))
    } catch (e) {
      console.warn('[imp] localStorage write failed', e)
    }
  },
}))
