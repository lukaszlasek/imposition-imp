/**
 * Browser download service.
 * Triggers a file download using only browser APIs — no server, no fetch (OUT-02).
 */

/**
 * Trigger a browser file download for the given bytes.
 *
 * @param bytes - The file content to download
 * @param filename - The filename to suggest to the browser
 */
export function triggerDownload(bytes: Uint8Array, filename: string): void {
  // Pure browser API — no server, no fetch (OUT-02 compliance)
  // Cast to ArrayBuffer to satisfy Blob constructor's BlobPart type requirement
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()

  // Cleanup: revoke object URL to free memory
  setTimeout(() => {
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }, 100)
}
