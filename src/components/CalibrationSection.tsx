import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useImpositionStore } from '../store/imposition'
import { generateCalibrationPDF } from '../services/calibrationGenerator'

// Inline label helper for consistent form styling (mirrors SettingsForm pattern)
function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: ReactNode
}) {
  const hintId = hint ? `${htmlFor}-hint` : undefined
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-semibold uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && (
        <span id={hintId} className="text-xs opacity-60">
          {hint}
        </span>
      )}
    </div>
  )
}

const inputClass = [
  'border-2 border-black rounded px-3 py-2 bg-paper text-black',
  'focus:outline-none focus:ring-2 focus:ring-red-imp focus:ring-offset-1',
].join(' ')

export function CalibrationSection() {
  const store = useImpositionStore()
  const { config } = store
  const [generating, setGenerating] = useState(false)

  // Hydrate calibration values from localStorage on mount
  useEffect(store.hydrateCalibration, [])

  const handleDownload = async () => {
    setGenerating(true)
    try {
      const bytes = await generateCalibrationPDF(config.paperSize)
      const url = URL.createObjectURL(new Blob([bytes as unknown as ArrayBuffer], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'imp-calibration.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="border-t-2 border-black pt-5 space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest opacity-50">
        Duplex Calibration
      </p>

      {/* Download calibration sheet */}
      <div className="flex flex-col gap-1">
        <button
          onClick={handleDownload}
          disabled={generating}
          className={[
            'border-2 border-black px-4 py-2 bg-black text-paper font-semibold uppercase tracking-wide',
            'focus:outline-none focus:ring-2 focus:ring-red-imp focus:ring-offset-1',
            generating ? 'opacity-60 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {generating ? 'Generating...' : 'Generate Calibration Sheet'}
        </button>
        <span className="text-xs opacity-60">
          Print this sheet duplex, then measure the offset between front and back crosshairs.
        </span>
      </div>

      {/* Duplex X offset — PRT-02 */}
      <Field
        label="Duplex Offset X (mm)"
        htmlFor="duplex-x"
        hint="Horizontal shift of the back side. Positive = right. Measure by printing the calibration sheet."
      >
        <input
          id="duplex-x"
          type="number"
          min={-20}
          max={20}
          step={0.1}
          value={config.duplexOffsetXMm}
          onChange={(e) => {
            const newX = parseFloat(e.target.value) || 0
            store.updateConfig({ duplexOffsetXMm: newX })
            store.persistCalibration(newX, config.duplexOffsetYMm ?? 0)
          }}
          className={inputClass}
          aria-describedby="duplex-x-hint"
        />
      </Field>

      {/* Duplex Y offset — PRT-02 */}
      <Field
        label="Duplex Offset Y (mm)"
        htmlFor="duplex-y"
        hint="Vertical shift of the back side. Positive = up."
      >
        <input
          id="duplex-y"
          type="number"
          min={-20}
          max={20}
          step={0.1}
          value={config.duplexOffsetYMm}
          onChange={(e) => {
            const newY = parseFloat(e.target.value) || 0
            store.updateConfig({ duplexOffsetYMm: newY })
            store.persistCalibration(config.duplexOffsetXMm ?? 0, newY)
          }}
          className={inputClass}
          aria-describedby="duplex-y-hint"
        />
      </Field>

      {/* Creep compensation — PRT-03 (document-specific; not persisted to localStorage) */}
      <Field
        label="Creep Compensation (mm)"
        htmlFor="creep"
        hint="Total inward shift for the innermost sheet. Use 0.3–1 mm per sheet of paper thickness. Leave at 0 for thin booklets."
      >
        <input
          id="creep"
          type="number"
          min={0}
          max={20}
          step={0.1}
          value={config.creepMm}
          onChange={(e) =>
            store.updateConfig({ creepMm: Math.max(0, parseFloat(e.target.value) || 0) })
          }
          className={inputClass}
          aria-describedby="creep-hint"
        />
      </Field>
    </div>
  )
}
