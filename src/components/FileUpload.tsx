import { useCallback, useState } from 'react'
import { useImpositionStore } from '../store/imposition'
import { loadPDF } from '../services/pdfParser'
import logo from '../logo-imp.png'

export function FileUpload() {
  const store = useImpositionStore()
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const processFile = useCallback(async (file: File) => {
    setLocalError(null)
    const bytes = new Uint8Array(await file.arrayBuffer())
    try {
      // [Rule 1 - Bug] setSourceFile takes (bytes, fileName, metadata, warning) — fileName is the
      // second arg (from the actual store implementation). Plan spec showed only 3 args but the
      // store was implemented with fileName as a separate field on the state.
      const result = await loadPDF({ name: file.name, bytes, fileSizeBytes: file.size })
      store.setSourceFile(bytes, file.name, result.metadata, result.warning)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to read PDF.')
    }
  }, [store])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') processFile(file)
    else setLocalError('Please drop a PDF file.')
  }, [processFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center pt-4 pb-2">
        <img src={logo} alt="Imp" width={400} />
      </div>

      <h2 className="text-xl font-bold uppercase tracking-tight">Upload PDF</h2>

      {/* Drop zone — keyboard accessible via label+input */}
      <label
        htmlFor="pdf-input"
        className={[
          'block border-4 border-dashed rounded cursor-pointer transition-colors',
          'px-8 py-12 text-center',
          isDragging
            ? 'border-red-imp bg-red-imp/5'
            : 'border-black hover:border-red-imp',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-red-imp focus-within:ring-offset-2',
        ].join(' ')}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <p className="text-base font-medium">
          Drag &amp; drop a PDF here, or click to select
        </p>
        <p className="text-sm opacity-60 mt-1">
          Max 100MB. Files over 50MB may be slow.
        </p>
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={handleInputChange}
          aria-label="Select a PDF file"
        />
      </label>

      {localError && (
        <p role="alert" className="text-red-imp font-medium text-sm border border-red-imp px-3 py-2 rounded">
          {localError}
        </p>
      )}
    </div>
  )
}
