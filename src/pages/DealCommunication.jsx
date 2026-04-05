import { useEffect, useMemo, useState } from 'react'
import { Bot, Copy, Lock, RefreshCw, Send, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'
import mockBuyers from '../data/mockBuyers'
import mockProducts from '../data/mockProducts'
import useUMKMStore from '../store/useUMKMStore'

const communicationTypes = [
  'RFQ Response',
  'Price Negotiation',
  'Complaint Handling',
  'Shipping Confirmation',
]

const negotiationTactics = ['Standard', 'Price Anchoring', 'Bundling Offer', 'Volume Discount']

const aiStages = [
  'AI menganalisis intensi email...',
  'Mengambil data produk dari knowledge base...',
  'Menyusun draf balasan...',
]

const emailScenarios = [
  {
    id: 'mail-001',
    sender: 'Sophia Reed - Oakridge Interiors Ltd.',
    subject: 'RFQ: Rattan Storage Baskets (MOQ 500 units, FOB Indonesia)',
    preview:
      'We are interested in your handwoven rattan baskets and would like your FOB offer for an MOQ of 500 units.',
    time: '09:20',
    body: `Dear TradeConnect Team,

We are currently sourcing handwoven rattan storage baskets for our 2026 spring collection in the UK market.

Could you please share your best FOB Indonesia quotation for 500 units MOQ, including available dimensions, lead time, and packaging details?

If your offer is aligned with our target price, we are prepared to discuss a trial shipment this month.

Best regards,
Sophia Reed
Procurement Manager
Oakridge Interiors Ltd.`,
    draft: `Subject: Re: RFQ - Rattan Storage Baskets (MOQ 500 units)

Dear Ms. Reed,

Thank you for your inquiry and your interest in our handwoven rattan storage baskets.

For a trial order of 500 units, our indicative FOB Indonesia offer is USD 8.90 per unit, based on mixed dimensions and export-grade packaging. Current lead time is 24-28 days after confirmation of specification and deposit receipt.

To support your spring launch timeline, we can prepare a pre-production sample set and share carton optimization details to ensure cost-efficient loading.

Please let us know your preferred size ratio and finishing preference so we can issue a formal quotation sheet within one business day.

Best regards,
Export Sales Team
TradeConnect`,
    explanation:
      'Draf ini menonjolkan respons RFQ yang tegas namun tetap membuka ruang klarifikasi spesifikasi agar negosiasi berjalan terstruktur.',
  },
  {
    id: 'mail-002',
    sender: 'Michael Tan - Pacific Home Goods',
    subject: 'Urgent: Shipment ETA Delay on PO-7842',
    preview:
      'Your previous ETA was not met and our retail partner is pushing for a revised delivery commitment.',
    time: '11:05',
    body: `Dear Export Team,

I am writing to raise a concern regarding PO-7842. The vessel ETA shared last week has already passed, and we have not received a confirmed revised schedule.

This delay is affecting our downstream retail commitments. Please provide an immediate update on shipment status, revised ETA, and your mitigation plan.

We need your formal response today.

Sincerely,
Michael Tan
Supply Chain Lead
Pacific Home Goods`,
    draft: `Subject: Re: Urgent - Shipment ETA Delay on PO-7842

Dear Mr. Tan,

Thank you for your message and for highlighting the urgency. We acknowledge the delay and apologize for the impact on your retail timeline.

Our logistics team has confirmed that the cargo is now secured on the next available vessel departing within 48 hours, with a revised ETA of 12 days from departure. We will share the updated booking confirmation and tracking reference within today.

As mitigation, we are prioritizing your documentation flow and arranging accelerated customs handover on arrival to reduce further delay risk.

We value your trust and will provide proactive milestone updates until delivery is completed.

Best regards,
Export Operations Team
TradeConnect`,
    explanation:
      'Draf ini menggunakan pola complaint handling: akui isu, berikan data korektif yang konkret, lalu tutup dengan komitmen update berkala.',
  },
  {
    id: 'mail-003',
    sender: 'Daniel Weber - Nordcraft Retail GmbH',
    subject: 'Price Discussion - Request for 15% Discount',
    preview:
      'Your quotation is close to our target, but we need a 15% price reduction to move forward.',
    time: '14:40',
    body: `Dear TradeConnect Sales Team,

Thank you for your quotation. Product quality appears suitable for our channel; however, your offered unit price is still above our buying benchmark.

To proceed with this quarter's purchasing cycle, we request a 15% discount on the quoted price.

Kindly confirm whether this adjustment can be accommodated.

Regards,
Daniel Weber
Category Buyer
Nordcraft Retail GmbH`,
    draft: `Subject: Re: Price Discussion - Request for 15% Discount

Dear Mr. Weber,

Thank you for your candid feedback and continued interest.

To maintain the agreed quality specification and supply reliability, a 15% reduction on base unit price is not feasible. However, we can support your margin objective through a structured commercial package: fixed pricing for the next two orders, complimentary pre-shipment sample logistics, and a volume-linked rebate once cumulative order volume reaches the agreed threshold.

This approach protects product consistency while creating measurable cost benefit on your side.

If aligned, we can finalize commercial terms in a short call this week.

Best regards,
International Sales Team
TradeConnect`,
    explanation:
      'Draf ini menggunakan teknik price anchoring dengan menjaga harga dasar tetap aman dan mengalihkan nilai ke skema benefit non-unit price.',
  },
]

function DealCommunication() {
  const selectedBuyerId = useUMKMStore((state) => state.selectedBuyerId)
  const onboardingData = useUMKMStore((state) => state.onboardingData)

  const selectedBuyer =
    mockBuyers.find((buyer) => buyer.id === selectedBuyerId) ||
    mockBuyers.find((buyer) => buyer.id === 'b-002') ||
    mockBuyers[0]

  const credibilityScore = useMemo(() => {
    if (selectedBuyer.riskLevel === 'low') return 88
    if (selectedBuyer.riskLevel === 'medium') return 74
    return 61
  }, [selectedBuyer])

  const umkmProduct = useMemo(() => {
    const fallback = mockProducts[1]
    return {
      name: onboardingData.product.productName || fallback.name,
      hsCode: onboardingData.product.hsCode || fallback.hsCode,
      capacity: onboardingData.product.monthlyCapacity || `${fallback.readyVolumeKg} kg/month`,
      price: onboardingData.product.priceRangeUsd || 'USD 8.40 - 9.30 / unit',
    }
  }, [onboardingData])

  const [communicationType, setCommunicationType] = useState('RFQ Response')
  const [negotiationTactic, setNegotiationTactic] = useState('Standard')
  const [selectedEmailId, setSelectedEmailId] = useState(emailScenarios[0].id)
  const [isGenerating, setIsGenerating] = useState(false)
  const [stageIndex, setStageIndex] = useState(0)
  const [draftText, setDraftText] = useState('')
  const [aiExplanation, setAIExplanation] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const selectedEmail = emailScenarios.find((item) => item.id === selectedEmailId) || emailScenarios[0]
  const loadingPercent = ((stageIndex + 1) / aiStages.length) * 100

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700)
    return () => clearTimeout(timer)
  }, [])

  const generateResponse = () => {
    setIsGenerating(true)
    setStageIndex(0)

    let currentIndex = 0
    const timer = setInterval(() => {
      currentIndex += 1
      if (currentIndex >= aiStages.length) {
        clearInterval(timer)
        setIsGenerating(false)
        setStageIndex(aiStages.length - 1)
        setDraftText(selectedEmail.draft)
        const tacticHint =
          negotiationTactics.includes(negotiationTactic) && negotiationTactic !== 'Standard'
            ? ` Fokus taktik aktif: ${negotiationTactic}.`
            : ''
        setAIExplanation(`${selectedEmail.explanation}${tacticHint}`)
        toast.success('Draf AI berhasil dibuat.')
        return
      }
      setStageIndex(currentIndex)
    }, 700)
  }

  const copyDraft = async () => {
    if (!draftText) return
    try {
      await navigator.clipboard.writeText(draftText)
      toast.success('Draf berhasil disalin.')
    } catch {
      toast.error('Clipboard tidak tersedia pada browser ini.')
    }
  }

  const sendAndSave = () => {
    if (!draftText) return
    toast.success('Draf terkirim dan tersimpan di histori komunikasi.')
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <LoadingSkeleton lines={4} />
        <div className="grid gap-4 xl:grid-cols-12">
          <LoadingSkeleton lines={8} className="xl:col-span-3" />
          <LoadingSkeleton lines={12} className="xl:col-span-6" />
          <LoadingSkeleton lines={10} className="xl:col-span-3" />
        </div>
      </section>
    )
  }

  return (
    <section>
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">AI Deal Communication Assistant</h1>
        <p className="text-sm text-slate-600">
          Simulasi RAG untuk membaca email buyer, mengambil konteks produk, dan menghasilkan draf balasan.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-12">
        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-surface p-4 xl:col-span-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">Panel Konteks</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Buyer Terpilih</h2>
            <div className="mt-2 space-y-1 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Nama:</span> {selectedBuyer.company}
              </p>
              <p>
                <span className="font-semibold">Negara:</span> {selectedBuyer.country}
              </p>
              <p>
                <span className="font-semibold">Credibility Score:</span> {credibilityScore}/100
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Info Produk UMKM</p>
            <p className="mt-1">Nama: {umkmProduct.name}</p>
            <p>Kode HS: {umkmProduct.hsCode}</p>
            <p>Kapasitas: {umkmProduct.capacity}</p>
            <p>Harga: {umkmProduct.price}</p>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Tipe Komunikasi
            <select
              value={communicationType}
              onChange={(event) => setCommunicationType(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
            >
              {communicationTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Taktik Negosiasi
            <select
              value={negotiationTactic}
              onChange={(event) => setNegotiationTactic(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
            >
              {negotiationTactics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </aside>

        <div className="rounded-2xl border border-slate-200 bg-surface p-4 xl:col-span-6">
          <h2 className="text-lg font-bold text-slate-900">Inbox Email Simulasi</h2>
          <p className="mb-3 text-sm text-slate-500">Pilih email masuk untuk membuka isi percakapan.</p>

          {emailScenarios.length === 0 ? (
            <EmptyState
              title="Inbox masih kosong"
              description="Email buyer akan tampil setelah sinkronisasi kanal komunikasi selesai."
            />
          ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              {emailScenarios.map((email) => (
                <button
                  key={email.id}
                  type="button"
                  onClick={() => {
                    setSelectedEmailId(email.id)
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedEmailId === email.id
                      ? 'border-primary bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-800">{email.sender}</p>
                    <span className="text-xs text-slate-500">{email.time}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-700">{email.subject}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{email.preview}</p>
                </button>
              ))}
            </div>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">From: {selectedEmail.sender}</p>
              <h3 className="mt-1 text-base font-bold text-slate-900">{selectedEmail.subject}</h3>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                {selectedEmail.body}
              </pre>

              <button
                type="button"
                onClick={generateResponse}
                disabled={isGenerating}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles size={15} /> Generate AI Response ✨
              </button>

              {isGenerating && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${loadingPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-primary">{aiStages[stageIndex]}</p>
                </div>
              )}
            </article>
          </div>
          )}
        </div>

        <aside className="space-y-3 rounded-2xl border border-slate-200 bg-surface p-4 xl:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Bot size={17} /> Draf Balasan AI
            </h2>
            <span
              title="AI tidak akan mengungkapkan harga minimum Anda kepada pihak eksternal"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700"
            >
              <Lock size={12} /> Floor Price Protected 🔒
            </span>
          </div>

          <textarea
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            placeholder="Generate AI response untuk menampilkan draf balasan..."
            className="min-h-72 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none ring-primary/20 focus:ring"
          />

          <div className="rounded-xl border border-primary/20 bg-blue-50 p-3 text-sm text-slate-700">
            <p className="mb-1 font-bold text-primary">Penjelasan AI</p>
            <p>
              {aiExplanation ||
                'AI akan menjelaskan alasan pemilihan gaya bahasa dan taktik negosiasi setelah draf dihasilkan.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyDraft}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Copy size={13} /> Salin Draf
            </button>
            <button
              type="button"
              onClick={sendAndSave}
              className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-white hover:bg-teal-700"
            >
              <Send size={13} /> Kirim & Simpan
            </button>
            <button
              type="button"
              onClick={generateResponse}
              disabled={isGenerating}
              className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={13} /> Generate Ulang
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Komunikasi aktif: <span className="font-semibold text-slate-700">{communicationType}</span>
          </p>
        </aside>
      </div>
    </section>
  )
}

export default DealCommunication