import { AlertTriangle } from 'lucide-react'

function RedFlagAlert({ message }) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-danger">
      <p className="flex items-start gap-2 text-sm font-semibold">
        <AlertTriangle size={16} className="mt-0.5" />
        {message}
      </p>
    </div>
  )
}

export default RedFlagAlert