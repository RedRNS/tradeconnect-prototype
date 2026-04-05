const statusStyles = {
  'New Inquiry': 'bg-blue-100 text-blue-700',
  'Warm Lead': 'bg-emerald-100 text-emerald-700',
  Negotiation: 'bg-amber-100 text-amber-700',
}

function StatusBadge({ status }) {
  const classes = statusStyles[status] || 'bg-slate-100 text-slate-700'

  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${classes}`}>{status}</span>
}

export default StatusBadge