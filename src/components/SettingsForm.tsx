import type { ReactNode } from 'react'
import { useImpositionStore } from '../store/imposition'

// Inline label helper for consistent form styling
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

export function SettingsForm() {
  const store = useImpositionStore()
  const { config } = store
  const isMultiSig = config.bindingMode === 'multi-signature'

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold uppercase tracking-tight">Settings</h2>

      {/* Paper Size — ENG-02 */}
      <Field
        label="Paper Size"
        htmlFor="paper-size"
        hint="Output sheet size. Pages will be scaled to fill each half of the sheet."
      >
        <select
          id="paper-size"
          value={config.paperSize}
          onChange={(e) =>
            store.updateConfig({ paperSize: e.target.value as typeof config.paperSize })
          }
          className={inputClass}
        >
          <option value="A4">A4 (210 × 297 mm)</option>
          <option value="A3">A3 (297 × 420 mm)</option>
          <option value="Letter">Letter (8.5 × 11 in)</option>
          <option value="Legal">Legal (8.5 × 14 in)</option>
        </select>
      </Field>

      {/* Binding Mode — ENG-01 / ENG-05 */}
      <Field
        label="Binding Mode"
        htmlFor="binding-mode"
        hint={
          isMultiSig
            ? 'Pages are split into multiple signatures, each folded and sewn separately.'
            : 'All pages folded as a single signature — ideal for short booklets.'
        }
      >
        <select
          id="binding-mode"
          value={config.bindingMode}
          onChange={(e) =>
            store.updateConfig({ bindingMode: e.target.value as typeof config.bindingMode })
          }
          className={inputClass}
        >
          <option value="saddle-stitch">Saddle Stitch (single signature)</option>
          <option value="multi-signature">Multi-Signature (perfect / case binding)</option>
        </select>
      </Field>

      {/* Sheets per Signature — ENG-03 (multi-sig only) */}
      {isMultiSig && (
        <Field
          label="Sheets per Signature"
          htmlFor="sheets-per-sig"
          hint="Physical sheets per folded section. 1 sheet = 4 pages. Common: 4 sheets = 16 pages per signature."
        >
          <input
            id="sheets-per-sig"
            type="number"
            min={1}
            max={20}
            value={config.sheetsPerSignature}
            onChange={(e) =>
              store.updateConfig({
                sheetsPerSignature: Math.max(1, parseInt(e.target.value) || 1),
              })
            }
            className={inputClass}
            aria-describedby="sheets-per-sig-hint"
          />
        </Field>
      )}

      {/* Binding Margin — PRT-01 */}
      <Field
        label="Binding Margin (mm)"
        htmlFor="binding-margin"
        hint="Extra space at the spine edge to prevent text from being hidden in the fold."
      >
        <input
          id="binding-margin"
          type="number"
          min={0}
          max={30}
          step={0.5}
          value={config.bindingMarginMm}
          onChange={(e) =>
            store.updateConfig({
              bindingMarginMm: Math.max(0, parseFloat(e.target.value) || 0),
            })
          }
          className={inputClass}
          aria-describedby="binding-margin-hint"
        />
      </Field>

    </div>
  )
}
