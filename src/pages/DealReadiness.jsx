import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react'
import { useEffect } from 'react'
import EmptyState from '../components/EmptyState'
import IncotermsCalculator from '../components/IncotermsCalculator'
import LoadingSkeleton from '../components/LoadingSkeleton'
import useUMKMStore from '../store/useUMKMStore'

const tabs = ['Kalkulator Harga Ekspor', 'Deteksi Red Flag', 'Cek Dokumen']

const redFlagPaymentMethods = [
  'L/C at Sight',
  'T/T in Advance',
  'DP 30%',
  'Open Account 90 Days',
  'Third-Party Transfer',
]

const highRiskCountries = ['Iran', 'North Korea', 'Syria', 'Belarus']

const initialRedFlagForm = {
  message: '',
  destinationCountry: '',
  consigneeName: '',
  paymentMethod: 'L/C at Sight',
  shippingRoute: '',
  asksOverInvoicing: false,
  consigneeDifferent: false,
  thirdCountryPayment: false,
}

const documentGroups = [
  {
    key: 'mandatory',
    title: 'Dokumen Wajib',
    documents: [
      {
        key: 'commercialInvoice',
        label: 'Commercial Invoice',
        info: 'Dokumen nilai transaksi resmi untuk keperluan customs clearance.',
      },
      {
        key: 'packingList',
        label: 'Packing List',
        info: 'Rincian isi kemasan, berat, dan dimensi tiap koli/barang.',
      },
      {
        key: 'billOfLading',
        label: 'Bill of Lading',
        info: 'Bukti kepemilikan barang dan kontrak pengangkutan dengan carrier.',
      },
      {
        key: 'pebInsw',
        label: 'PEB (INSW)',
        info: 'Pemberitahuan Ekspor Barang yang diajukan melalui sistem INSW.',
      },
      {
        key: 'cooSka',
        label: 'COO/SKA',
        info: 'Sertifikat asal barang untuk klaim tarif preferensi di negara tujuan.',
      },
    ],
  },
  {
    key: 'supporting',
    title: 'Dokumen Pendukung',
    documents: [
      {
        key: 'proformaInvoice',
        label: 'Proforma Invoice',
        info: 'Dokumen penawaran awal berisi estimasi harga dan syarat penjualan.',
      },
      {
        key: 'purchaseOrder',
        label: 'Purchase Order',
        info: 'Dokumen pesanan resmi pembeli sebagai dasar pemenuhan order.',
      },
      {
        key: 'salesContract',
        label: 'Kontrak Jual Beli',
        info: 'Perjanjian legal yang mengikat kewajiban penjual dan pembeli.',
      },
    ],
  },
  {
    key: 'certificates',
    title: 'Sertifikat Produk',
    documents: [
      {
        key: 'phytosanitary',
        label: 'Fitosanitasi',
        info: 'Sertifikat kesehatan tumbuhan untuk komoditas agrikultur/hortikultura.',
      },
      {
        key: 'sni',
        label: 'SNI',
        info: 'Standar Nasional Indonesia sesuai kategori produk tertentu.',
      },
      {
        key: 'halalMui',
        label: 'Halal MUI',
        info: 'Sertifikasi halal untuk produk pangan/konsumsi muslim market.',
      },
      {
        key: 'bpom',
        label: 'BPOM',
        info: 'Izin edar/registrasi untuk pangan olahan, kosmetik, atau obat tertentu.',
      },
      {
        key: 'vlegal',
        label: 'V-Legal/SVLK',
        info: 'Legalitas kayu untuk ekspor produk kehutanan atau turunannya.',
      },
    ],
  },
]

function evaluateRedFlag(form) {
  const findings = []
  let score = 12

  if (form.asksOverInvoicing) {
    score += 35
    findings.push({
      level: 'red',
      title: 'Permintaan over-invoicing terdeteksi',
      detail:
        'Permintaan manipulasi nilai invoice berpotensi terkait Trade-Based Money Laundering. Referensi: FinCEN Advisory FIN-2020-A005.',
    })
  }

  if (form.thirdCountryPayment || form.paymentMethod === 'Third-Party Transfer') {
    score += 28
    findings.push({
      level: 'red',
      title: 'Pembayaran melalui pihak ketiga/negara ketiga',
      detail:
        'Skema ini meningkatkan risiko layering dana dan beneficial owner tidak transparan. Referensi: FinCEN & FATF red flags.',
    })
  }

  if (form.consigneeDifferent) {
    score += 18
    findings.push({
      level: 'warn',
      title: 'Consignee berbeda dari pembeli',
      detail:
        'Perbedaan pihak kontrak dan consignee wajib diverifikasi dokumen end-user untuk mencegah diversion risk. Referensi: BIS Know Your Customer.',
    })
  }

  if (highRiskCountries.includes(form.destinationCountry.trim())) {
    score += 30
    findings.push({
      level: 'red',
      title: 'Negara tujuan berisiko tinggi',
      detail:
        'Destinasi termasuk yurisdiksi dengan pengawasan ketat terkait sanctions/export control. Referensi: BIS Entity & Country Guidance.',
    })
  }

  const routeText = form.shippingRoute.toLowerCase()
  if (routeText.includes('free trade zone') || routeText.includes('transshipment')) {
    score += 15
    findings.push({
      level: 'warn',
      title: 'Rute transshipment/FTZ terdeteksi',
      detail:
        'Rute berlapis memerlukan due diligence tambahan untuk menilai risiko re-export tidak sah.',
    })
  }

  const emailText = form.message.toLowerCase()
  if (
    emailText.includes('split invoice') ||
    emailText.includes('under declare') ||
    emailText.includes('avoid customs') ||
    emailText.includes('confidential transfer')
  ) {
    score += 22
    findings.push({
      level: 'red',
      title: 'Konten komunikasi mencurigakan',
      detail:
        'Frasa terkait penghindaran bea/cukai merupakan indikator risiko kepatuhan tinggi dan perlu eskalasi legal/compliance.',
    })
  }

  if (form.paymentMethod === 'Open Account 90 Days') {
    score += 12
    findings.push({
      level: 'warn',
      title: 'Metode pembayaran berisiko arus kas',
      detail: 'Open account tenor panjang meningkatkan risiko non-payment tanpa instrumen mitigasi.',
    })
  }

  if (findings.length === 0) {
    findings.push({
      level: 'ok',
      title: 'Struktur transaksi terlihat wajar',
      detail: 'Tidak ada indikator kuat TBML/sanctions red flag dari input saat ini.',
    })
  }

  findings.push({
    level: 'ok',
    title: 'Rekomendasi kontrol dokumen',
    detail:
      'Pastikan dokumen KYC buyer, kontrak dagang, dan proof of payment tervalidasi sebelum shipment release.',
  })

  const normalizedScore = Math.min(score, 100)
  const level = normalizedScore >= 70 ? 'HIGH' : normalizedScore >= 40 ? 'MEDIUM' : 'LOW'
  return { score: normalizedScore, level, findings }
}

function statusIcon(level) {
  if (level === 'red') return '🔴 RED FLAG'
  if (level === 'warn') return '🟡 PERHATIAN'
  return '🟢 OK'
}

function gaugeColor(level) {
  if (level === 'HIGH') return '#DC2626'
  if (level === 'MEDIUM') return '#F59E0B'
  return '#0F766E'
}

function DealReadiness() {
  const onboardingData = useUMKMStore((state) => state.onboardingData)
  const [activeTab, setActiveTab] = useState('Kalkulator Harga Ekspor')
  const [form, setForm] = useState(initialRedFlagForm)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [checkedDocs, setCheckedDocs] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(timer)
  }, [])

  const productText = `${onboardingData.product.productName} ${onboardingData.product.productDescription}`.toLowerCase()

  const recommendedCertificates = useMemo(() => {
    if (productText.includes('rattan') || productText.includes('kayu')) return ['vlegal', 'sni']
    if (productText.includes('kopi') || productText.includes('rempah') || productText.includes('spice')) {
      return ['phytosanitary', 'halalMui', 'bpom']
    }
    return ['sni']
  }, [productText])

  const allDocuments = documentGroups.flatMap((group) => group.documents)
  const mandatoryKeys = documentGroups[0].documents.map((doc) => doc.key)
  const checkedCount = allDocuments.filter((doc) => checkedDocs[doc.key]).length
  const totalCount = allDocuments.length
  const completionRatio = totalCount === 0 ? 0 : (checkedCount / totalCount) * 100
  const allMandatoryChecked = mandatoryKeys.every((key) => checkedDocs[key])

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleDocument = (key) => {
    setCheckedDocs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const analyzeRedFlags = () => {
    setAnalyzing(true)
    setAnalysis(null)

    setTimeout(() => {
      setAnalyzing(false)
      setAnalysis(evaluateRedFlag(form))
    }, 2000)
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <LoadingSkeleton lines={4} />
        <LoadingSkeleton lines={8} />
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Cek Kesiapan Deal</h1>
        <p className="text-sm text-slate-600">
          Validasi harga ekspor, screening red flag kepatuhan, dan kelengkapan dokumen sebelum closing.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Kalkulator Harga Ekspor' && <IncotermsCalculator />}

      {activeTab === 'Deteksi Red Flag' && (
        <article className="rounded-2xl border border-slate-200 bg-surface p-4 md:p-5">
          <h2 className="text-lg font-bold text-slate-900">Deteksi Red Flag</h2>
          <p className="mb-4 text-sm text-slate-500">
            Simulasikan pemeriksaan red flag kepatuhan transaksi ekspor menggunakan AI rule-based.
          </p>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Tempel teks email atau deskripsi permintaan pembeli
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(event) => updateForm('message', event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Negara tujuan pembeli
                  <input
                    type="text"
                    value={form.destinationCountry}
                    onChange={(event) => updateForm('destinationCountry', event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Nama consignee di B/L
                  <input
                    type="text"
                    value={form.consigneeName}
                    onChange={(event) => updateForm('consigneeName', event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Metode pembayaran yang diminta pembeli
                  <select
                    value={form.paymentMethod}
                    onChange={(event) => updateForm('paymentMethod', event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
                  >
                    {redFlagPaymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Rute pengiriman (opsional)
                  <input
                    type="text"
                    value={form.shippingRoute}
                    onChange={(event) => updateForm('shippingRoute', event.target.value)}
                    placeholder="Contoh: Jakarta - Singapore FTZ - Hamburg"
                    className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
                  />
                </label>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.asksOverInvoicing}
                    onChange={(event) => updateForm('asksOverInvoicing', event.target.checked)}
                  />
                  Minta over-invoicing?
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.consigneeDifferent}
                    onChange={(event) => updateForm('consigneeDifferent', event.target.checked)}
                  />
                  Consignee berbeda dari pembeli?
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.thirdCountryPayment}
                    onChange={(event) => updateForm('thirdCountryPayment', event.target.checked)}
                  />
                  Pembayaran ke rekening negara ketiga?
                </label>
              </div>

              <button
                type="button"
                onClick={analyzeRedFlags}
                disabled={analyzing}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Analisis Red Flag AI
              </button>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {!analysis && !analyzing && (
                <EmptyState
                  title="Belum ada hasil analisis"
                  description="Klik Analisis Red Flag AI untuk melihat meter risiko dan daftar temuan."
                />
              )}

              {analyzing && (
                <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-primary">
                  <p>Menganalisis pola transaksi...</p>
                  <p>Memeriksa indikator kepatuhan FinCEN/BIS...</p>
                </div>
              )}

              {analysis && (
                <>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Meter Risiko Keseluruhan</p>
                    <div className="flex items-center gap-4">
                      <div
                        className="relative h-24 w-24 rounded-full"
                        style={{
                          background: `conic-gradient(${gaugeColor(analysis.level)} ${analysis.score * 3.6}deg, #e2e8f0 0deg)`,
                        }}
                      >
                        <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700">
                          {analysis.score}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Risk Level</p>
                        <p className="text-2xl font-extrabold" style={{ color: gaugeColor(analysis.level) }}>
                          {analysis.level}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {analysis.findings.map((item, index) => (
                      <article
                        key={`${item.title}-${index}`}
                        className="slide-in-item rounded-xl border border-slate-200 bg-white p-3"
                        style={{ animationDelay: `${index * 120}ms` }}
                      >
                        <p className="text-sm font-bold text-slate-900">{statusIcon(item.level)}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.detail}</p>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </article>
      )}

      {activeTab === 'Cek Dokumen' && (
        <article className="rounded-2xl border border-slate-200 bg-surface p-4 md:p-5">
          <h2 className="text-lg font-bold text-slate-900">Cek Dokumen Ekspor</h2>
          <p className="text-sm text-slate-500">Checklist interaktif untuk memastikan kepatuhan dokumen sebelum deal.</p>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>Kelengkapan Dokumen: {checkedCount}/{totalCount}</span>
              <span>{Math.round(completionRatio)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-500"
                style={{ width: `${completionRatio}%` }}
              />
            </div>
          </div>

          {allMandatoryChecked && (
            <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
              Dokumen lengkap. Siap untuk pengajuan L/C.
            </div>
          )}

          <div className="mt-4 space-y-4">
            {documentGroups.map((group) => (
              <section key={group.key} className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-base font-bold text-slate-900">{group.title}</h3>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {group.documents.map((doc) => {
                    const isRecommended = recommendedCertificates.includes(doc.key)
                    return (
                      <label
                        key={doc.key}
                        className="group relative flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(checkedDocs[doc.key])}
                            onChange={() => toggleDocument(doc.key)}
                          />
                          <span>
                            {doc.label}
                            {isRecommended && (
                              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-primary">
                                Direkomendasikan
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="relative inline-flex">
                          <Info size={14} className="text-slate-500" />
                          <span className="pointer-events-none absolute bottom-6 right-0 z-10 hidden w-56 rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                            {doc.info}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </article>
      )}

      <article className="rounded-2xl border border-slate-200 bg-surface p-4">
        <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-slate-900">
          <ShieldAlert size={16} /> Quick Risk Playbook
        </h3>
        <ul className="space-y-1 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 size={15} className="mt-0.5 text-secondary" />
            Prioritaskan pembayaran aman (L/C at sight) untuk buyer baru.
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle size={15} className="mt-0.5 text-accent" />
            Hindari perubahan consignee mendadak tanpa amandemen kontrak.
          </li>
        </ul>
      </article>
    </section>
  )
}

export default DealReadiness