import type { ReactNode } from 'react'

interface LayoutProps { children: ReactNode }

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-paper text-black font-sans">
      <header className="border-b-4 border-black px-6 py-4 flex items-center gap-3">
        <span className="text-2xl font-black tracking-tighter uppercase text-red-imp">Imp</span>
        <span className="text-sm font-medium uppercase tracking-widest text-black opacity-60">
          Print Imposition
        </span>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}
