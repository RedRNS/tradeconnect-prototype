import { CheckCircle2, CircleX, Globe2, MailCheck, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'
import useUMKMStore from '../store/useUMKMStore'

const metrics = [
  { label: 'Pembeli Potensial Teridentifikasi', value: '12', color: 'text-primary' },
  { label: 'Match Score Tertinggi', value: '94%', color: 'text-secondary' },
  { label: 'Pasar Aktif', value: '8 negara', color: 'text-slate-900' },
  { label: 'Peringatan Aktif', value: '1 red flag', color: 'text-danger' },
]

const recommendedBuyers = [
  { flag: '🇯🇵', name: 'Kyoto Craft Imports', score: 94 },
  { flag: '🇳🇱', name: 'Holland Living BV', score: 89 },
  { flag: '🇦🇪', name: 'Desert Home Trading', score: 86 },
]

const activeDealTimeline = ['Email dikirim', 'Menunggu respons', 'Negosiasi harga']

const marketOpportunities = [
  { country: 'Jepang', value: 34 },
  { country: 'Belanda', value: 28 },
  { country: 'UAE', value: 18 },
  { country: 'USA', value: 12 },
  { country: 'Lainnya', value: 8 },
]

const readinessItems = [
  { label: 'Legalitas NIB terverifikasi', done: true },
  { label: 'Kode HS produk sudah diklasifikasi', done: true },
  { label: 'Dokumen COO/SKA disiapkan', done: false },
  { label: 'Simulasi harga CIF disetujui', done: true },
]

function Dashboard() {
  const umkmName = useUMKMStore((state) => state.umkmName)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 650)
    return () => clearTimeout(timer)
  }, [])

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    []
  )

  if (isLoading) {
    return (
      <section className="space-y-4">
        <LoadingSkeleton lines={4} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <LoadingSkeleton lines={3} />
          <LoadingSkeleton lines={3} />
          <LoadingSkeleton lines={3} />
          <LoadingSkeleton lines={3} />
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-5 text-white shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold md:text-3xl">Selamat datang, {umkmName} 👋</h1>
            <p className="mt-1 text-sm text-blue-100">{todayLabel}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={14} /> Profil Terverifikasi · Skor Kredibilitas: 78/100
          </span>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{item.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${item.color}`}>{item.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-bold text-slate-900">Top 3 Pembeli Rekomendasi</h2>
          {recommendedBuyers.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                title="Belum ada rekomendasi pembeli"
                description="Sistem akan mengisi daftar setelah profil ekspor dianalisis."
              />
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {recommendedBuyers.map((buyer) => (
                <li
                  key={buyer.name}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{buyer.flag}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{buyer.name}</p>
                      <p className="text-xs text-slate-500">Match Score: {buyer.score}%</p>
                    </div>
                  </div>
                  <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700">
                    Hubungi
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-bold text-slate-900">Status Deal Aktif</h2>
          <ol className="mt-3 space-y-3">
            {activeDealTimeline.map((status, index) => (
              <li key={status} className="relative pl-7 text-sm text-slate-700">
                <span className="absolute left-0 top-0.5 h-3 w-3 rounded-full bg-secondary" />
                {index < activeDealTimeline.length - 1 && (
                  <span className="absolute left-1.5 top-4 h-8 w-px bg-slate-300" />
                )}
                <span className="font-semibold">{status}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Peluang Pasar per Negara</h2>
          <div className="space-y-2">
            {marketOpportunities.map((item) => (
              <div key={item.country}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
                  <span>{item.country}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Checklist Kesiapan</h2>
          <ul className="space-y-2">
            {readinessItems.map((item) => (
              <li key={item.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-700">{item.label}</span>
                {item.done ? (
                  <CheckCircle2 size={16} className="text-secondary" />
                ) : (
                  <CircleX size={16} className="text-danger" />
                )}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        💡 Tip dari TradeConnect: UMKM dengan sertifikasi Halal MUI memiliki peluang 3x lebih tinggi di pasar Timur Tengah. Lengkapi profil Anda.
      </div>

      <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 sm:grid-cols-3">
        <p className="inline-flex items-center gap-1">
          <MailCheck size={13} /> Responsivitas buyer dipantau harian
        </p>
        <p className="inline-flex items-center gap-1">
          <ShieldAlert size={13} /> 1 red flag aktif terdeteksi minggu ini
        </p>
        <p className="inline-flex items-center gap-1">
          <Globe2 size={13} /> Analitik pasar menggunakan data sintetis
        </p>
      </div>
    </section>
  )
}

export default Dashboard