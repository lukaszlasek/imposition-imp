import { useImpositionStore } from '../store/imposition'
import { generateImposedPDF } from '../services/outputGenerator'
import { triggerDownload } from '../services/download'
import { calculateSaddleStitch } from '../services/imposition/saddleStitch'
import { calculateMultiSignature } from '../services/imposition/multiSignature'
import { pointsToMm } from '../utils/coordinates'

export function StatusPanel() {
  const store = useImpositionStore()
  // [Rule 1 - Bug] sourceMetadata does not have a fileName field — file name is stored
  // separately as sourceFileName on the store. Plan spec referenced sourceMetadata.fileName
  // which does not exist in the PDFMetadata type.
  const { sourceMetadata, sourceFileName, sourceWarning, config, step, imposedPDFBytes, addBlanksChoice } = store

  if (!sourceMetadata) return null

  // ENG-06: Check divisibility immediately on render — warning is proactive, not triggered by Compose.
  // Both algorithms return { needsBlanks, blanksNeeded } when pageCount % 4 !== 0.
  const divisibilityCheck =
    config.bindingMode === 'multi-signature'
      ? calculateMultiSignature(sourceMetadata.pageCount, Math.max(1, config.sheetsPerSignature ?? 1))
      : calculateSaddleStitch(sourceMetadata.pageCount)
  const hasDivisibilityIssue = 'needsBlanks' in divisibilityCheck

  // Show the blanks decision UI when: issue exists AND user hasn't chosen yet
  const showBlanksDecision = hasDivisibilityIssue && addBlanksChoice === null

  // [Rule 1 - Bug] PDFMetadata.dimensions uses widthPt/heightPt — not width/height.
  // Plan spec used dimensions.width / dimensions.height which don't exist on PageDimensions.
  const widthMm = Math.round(pointsToMm(sourceMetadata.dimensions.widthPt))
  const heightMm = Math.round(pointsToMm(sourceMetadata.dimensions.heightPt))

  const handleCompose = async () => {
    if (!store.sourceFileBytes) return

    store.setIsProcessing(true)
    store.setStep('composing')
    try {
      // [Rule 1 - Bug] store config is Omit<ImpositionConfig, 'pageCount'>; generateImposedPDF
      // requires full ImpositionConfig including pageCount. Spread config and add pageCount.
      const fullConfig = { ...config, pageCount: sourceMetadata.pageCount }
      const bytes = await generateImposedPDF(
        store.sourceFileBytes,
        fullConfig,
        addBlanksChoice ?? false
      )
      store.setImposedPDF(bytes)
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Composition failed.')
    } finally {
      store.setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!imposedPDFBytes) return
    // [Rule 1 - Bug] sourceMetadata has no fileName — use store.sourceFileName instead.
    const baseName = (sourceFileName ?? 'document').replace(/\.pdf$/i, '')
    triggerDownload(imposedPDFBytes, `${baseName}-imposed.pdf`)
  }

  const btnBase = [
    'font-bold uppercase tracking-wide px-5 py-2 border-2 border-black rounded',
    'focus:outline-none focus:ring-2 focus:ring-red-imp focus:ring-offset-2',
    'transition-colors',
  ].join(' ')
  const btnPrimary = btnBase + ' bg-black text-paper hover:bg-red-imp hover:border-red-imp'
  const btnSecondary = btnBase + ' bg-paper text-black hover:bg-black hover:text-paper'

  return (
    <div className="space-y-5 mt-8">
      {/* File metadata */}
      <div className="border-2 border-black rounded p-4 space-y-2">
        <p className="font-bold text-sm uppercase tracking-wide">Loaded PDF</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="opacity-60">File</dt>
          <dd className="font-medium truncate" title={sourceFileName ?? undefined}>{sourceFileName}</dd>
          <dt className="opacity-60">Pages</dt>
          <dd className="font-medium">{sourceMetadata.pageCount}</dd>
          <dt className="opacity-60">Page size</dt>
          <dd className="font-medium">{widthMm} × {heightMm} mm</dd>
          <dt className="opacity-60">File size</dt>
          <dd className="font-medium">{(sourceMetadata.fileSizeBytes / 1048576).toFixed(1)} MB</dd>
        </dl>
      </div>

      {/* Large file warning (IMP-03) */}
      {sourceWarning === 'large-file' && (
        <div role="alert" className="border-2 border-black rounded p-3 bg-paper">
          <p className="text-sm font-medium">
            <span className="text-red-imp font-bold">Warning:</span>{' '}
            This file is over 50MB. Processing may be slow on some devices.
          </p>
        </div>
      )}

      {/* ENG-06: Page count divisibility warning — shown immediately after upload, before Compose is clicked.
          Displayed whenever pageCount % 4 !== 0 AND user hasn't made a blanks choice yet. */}
      {showBlanksDecision && (
        <div role="alert" className="border-2 border-black rounded p-4 space-y-3">
          <p className="text-sm font-medium">
            <span className="text-red-imp font-bold">Page count issue:</span>{' '}
            {sourceMetadata.pageCount} pages is not divisible by 4.
            {' '}
            {'blanksNeeded' in divisibilityCheck
              ? `${divisibilityCheck.blanksNeeded} blank page(s) must be added.`
              : ''}
          </p>
          <div className="flex gap-3">
            <button
              className={btnPrimary}
              onClick={() => store.setAddBlanksChoice(true)}
            >
              Add blank pages
            </button>
            <button
              className={btnSecondary}
              onClick={() => store.setAddBlanksChoice(false)}
            >
              Proceed anyway
            </button>
          </div>
        </div>
      )}

      {/* Compose button — shown when in settings step and no pending blanks decision */}
      {step === 'settings' && !showBlanksDecision && (
        <button
          className={btnPrimary + ' w-full py-3'}
          onClick={handleCompose}
          disabled={store.isProcessing}
        >
          {store.isProcessing ? 'Composing...' : 'Compose imposed PDF'}
        </button>
      )}

      {/* Composing state */}
      {step === 'composing' && (
        <p className="text-center font-medium" aria-live="polite">
          Generating imposed PDF...
        </p>
      )}

      {/* Done state / download */}
      {step === 'done' && imposedPDFBytes && (
        <div className="space-y-3">
          <p className="font-medium text-sm">
            Imposed PDF ready — {(imposedPDFBytes.length / 1048576).toFixed(1)} MB
          </p>
          <button className={btnPrimary + ' w-full py-3'} onClick={handleDownload}>
            Download imposed PDF
          </button>
          <button
            className={btnSecondary + ' w-full'}
            onClick={store.reset}
          >
            Start over
          </button>
        </div>
      )}

      {/* Error state */}
      {step === 'error' && store.error && (
        <div role="alert" className="border-2 border-red-imp rounded p-4">
          <p className="font-bold text-red-imp text-sm">Error</p>
          <p className="text-sm mt-1">{store.error}</p>
          <button className={btnSecondary + ' mt-3'} onClick={store.reset}>
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
