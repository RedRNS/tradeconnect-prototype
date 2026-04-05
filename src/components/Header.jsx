import { BellDot } from 'lucide-react'
import useUMKMStore from '../store/useUMKMStore'

function Header() {
  const umkmName = useUMKMStore((state) => state.umkmName)

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-surface/95 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">UMKM Login</p>
          <h2 className="text-lg font-bold text-slate-900 md:text-xl">{umkmName}</h2>
        </div>
        <button
          type="button"
          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-secondary hover:text-secondary"
          aria-label="Notifikasi"
        >
          <BellDot size={20} />
        </button>
      </div>
    </header>
  )
}

export default Header