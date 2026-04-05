function EmptyState({
  title = 'Belum ada data',
  description = 'Data akan muncul setelah aktivitas pertama dilakukan.',
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <svg
        viewBox="0 0 160 110"
        className="mx-auto mb-4 h-28 w-40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="16" y="16" width="128" height="78" rx="12" fill="#E2E8F0" />
        <rect x="26" y="28" width="70" height="8" rx="4" fill="#CBD5E1" />
        <rect x="26" y="44" width="108" height="6" rx="3" fill="#CBD5E1" />
        <rect x="26" y="56" width="90" height="6" rx="3" fill="#CBD5E1" />
        <circle cx="120" cy="79" r="12" fill="#BFDBFE" />
      </svg>
      <p className="text-base font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}

export default EmptyState