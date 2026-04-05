import { Building2, Globe2 } from 'lucide-react'
import StatusBadge from './StatusBadge'

function BuyerCard({ buyer, onContact, contacted }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">{buyer.company}</h3>
          <p className="mt-1 text-sm text-slate-500">{buyer.interest}</p>
        </div>
        <StatusBadge status={buyer.status} />
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Building2 size={15} />
          B2B Buyer
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Globe2 size={15} />
          {buyer.country}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">Match: {buyer.matchScore || 82}%</p>
        <button
          type="button"
          onClick={onContact}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            contacted
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-primary text-white hover:bg-blue-700'
          }`}
        >
          {contacted ? 'Sudah Dihubungi' : 'Hubungi'}
        </button>
      </div>
    </article>
  )
}

export default BuyerCard