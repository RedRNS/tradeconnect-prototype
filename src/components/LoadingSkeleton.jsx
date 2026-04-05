function LoadingSkeleton({ lines = 5, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className="mb-3 h-5 w-40 animate-pulse rounded bg-slate-200" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-4 animate-pulse rounded bg-slate-100"
            style={{ width: `${100 - index * 6}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export default LoadingSkeleton