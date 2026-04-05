import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, LoaderCircle, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
import LoadingSkeleton from '../components/LoadingSkeleton'
import PageTransition from '../components/PageTransition'
import useUMKMStore from '../store/useUMKMStore'

const steps = [
  'Verifikasi Legalitas',
  'Profil Produk',
  'Kapabilitas Ekspor',
  'Review & Submit',
]

const certificationsList = ['BPOM', 'SNI', 'Halal MUI', 'ISO', 'V-Legal']

function classifyHSCode(text) {
  const source = text.toLowerCase()
  if (source.includes('kopi') || source.includes('coffee')) return '0901.21'
  if (source.includes('kakao') || source.includes('cocoa')) return '1801.00'
  if (source.includes('rempah') || source.includes('cinnamon') || source.includes('spice')) {
    return '0906.11'
  }
  if (source.includes('gula') || source.includes('sugar')) return '1702.90'
  return '2106.90'
}

function calculateProfileScore(data) {
  let score = 0
  if (data.legal.verificationStatus === 'success') score += 30
  if (data.product.productName.trim()) score += 10
  if (data.product.productDescription.trim().length > 30) score += 10
  if (data.product.hsCode) score += 12
  if (data.product.monthlyCapacity) score += 8
  if (data.product.moq) score += 5
  if (data.product.priceRangeUsd) score += 8
  if (data.product.photoPreview) score += 5
  if (data.exportCapability.logisticsReadiness) score += 4
  if (data.exportCapability.paymentMethod) score += 4
  if (data.exportCapability.certifications.length > 0) score += 4
  return Math.min(score, 100)
}

function Onboarding() {
  const navigate = useNavigate()
  const onboardingData = useUMKMStore((state) => state.onboardingData)
  const setUMKMName = useUMKMStore((state) => state.setUMKMName)
  const updateOnboardingField = useUMKMStore((state) => state.updateOnboardingField)
  const updateOnboardingScore = useUMKMStore((state) => state.updateOnboardingScore)
  const toggleCertification = useUMKMStore((state) => state.toggleCertification)
  const completeOnboarding = useUMKMStore((state) => state.completeOnboarding)
  const [currentStep, setCurrentStep] = useState(1)
  const [verifyingNIB, setVerifyingNIB] = useState(false)
  const [classifyingHS, setClassifyingHS] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 650)
    return () => clearTimeout(timer)
  }, [])

  const targetScore = useMemo(() => calculateProfileScore(onboardingData), [onboardingData])

  useEffect(() => {
    updateOnboardingScore(targetScore)
  }, [targetScore, updateOnboardingScore])

  useEffect(() => {
    if (currentStep !== 4) return
    setAnimatedScore(0)
    let value = 0
    const interval = setInterval(() => {
      value += 2
      if (value >= targetScore) {
        setAnimatedScore(targetScore)
        clearInterval(interval)
        return
      }
      setAnimatedScore(value)
    }, 25)

    return () => clearInterval(interval)
  }, [currentStep, targetScore])

  const stepProgress = (currentStep / 4) * 100

  const handleVerifyNIB = () => {
    updateOnboardingField('legal', 'verificationStatus', 'loading')
    updateOnboardingField('legal', 'verificationError', '')
    updateOnboardingField('legal', 'businessName', '')
    updateOnboardingField('legal', 'kbli', '')
    updateOnboardingField('legal', 'businessScale', '')
    setVerifyingNIB(true)

    setTimeout(() => {
      setVerifyingNIB(false)
      if (onboardingData.legal.nib === '1234567890123456') {
        updateOnboardingField('legal', 'verificationStatus', 'success')
        updateOnboardingField('legal', 'businessName', 'PT Kopi Nusantara Sejahtera')
        updateOnboardingField('legal', 'kbli', '10761 - Industri Pengolahan Kopi')
        updateOnboardingField('legal', 'businessScale', 'Menengah')
        setUMKMName('PT Kopi Nusantara Sejahtera')
      } else {
        updateOnboardingField('legal', 'verificationStatus', 'error')
        updateOnboardingField(
          'legal',
          'verificationError',
          'Nomor NIB tidak ditemukan pada sistem OSS RBA. Mohon periksa kembali.'
        )
      }
    }, 1500)
  }

  const handleClassifyHSCode = () => {
    const source = `${onboardingData.product.productName} ${onboardingData.product.productDescription}`.trim()
    if (!source) return

    setClassifyingHS(true)
    updateOnboardingField('product', 'hsStatus', 'loading')
    setTimeout(() => {
      const hsCode = classifyHSCode(source)
      setClassifyingHS(false)
      updateOnboardingField('product', 'hsCode', hsCode)
      updateOnboardingField('product', 'hsStatus', 'success')
    }, 1300)
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    updateOnboardingField('product', 'photoName', file.name)
    updateOnboardingField('product', 'photoPreview', preview)
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onboardingData.legal.businessName) {
      setUMKMName(onboardingData.legal.businessName)
    }
    completeOnboarding()
    toast.success('Profil UMKM berhasil disimpan.')
    navigate('/buyer-discovery')
  }

  if (isLoading) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-background px-4 py-8 md:px-6">
          <div className="mx-auto max-w-4xl space-y-4">
            <LoadingSkeleton lines={5} />
            <LoadingSkeleton lines={7} />
            <AppFooter />
          </div>
        </main>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-background px-4 py-8 md:px-6">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl rounded-3xl bg-surface p-6 shadow-soft md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Onboarding UMKM</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Verified Export Profile Setup</h1>
        <p className="mt-2 text-sm text-slate-600">Bangun profil kredibel agar buyer internasional lebih cepat percaya.</p>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
            <span>Step {currentStep} of 4</span>
            <span>{steps[currentStep - 1]}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
        </div>

        {currentStep === 1 && (
          <section className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Step 1: Verifikasi Legalitas</h2>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Nomor Induk Berusaha (NIB)
              <input
                type="text"
                value={onboardingData.legal.nib}
                onChange={(e) => updateOnboardingField('legal', 'nib', e.target.value)}
                placeholder="Contoh valid: 1234567890123456"
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
              />
            </label>
            <button
              type="button"
              onClick={handleVerifyNIB}
              disabled={!onboardingData.legal.nib || verifyingNIB}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Verifikasi NIB
            </button>

            {(verifyingNIB || onboardingData.legal.verificationStatus === 'loading') && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                <LoaderCircle size={16} className="animate-spin" />
                Memverifikasi ke OSS RBA...
              </div>
            )}

            {onboardingData.legal.verificationStatus === 'success' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={14} />
                  Terverifikasi ✓
                </p>
                <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
                  <p>
                    <span className="font-semibold">Nama Usaha:</span> {onboardingData.legal.businessName}
                  </p>
                  <p>
                    <span className="font-semibold">KBLI:</span> {onboardingData.legal.kbli}
                  </p>
                  <p>
                    <span className="font-semibold">Skala:</span> {onboardingData.legal.businessScale}
                  </p>
                </div>
              </div>
            )}

            {onboardingData.legal.verificationStatus === 'error' && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm font-semibold text-danger">
                {onboardingData.legal.verificationError}
              </div>
            )}
          </section>
        )}

        {currentStep === 2 && (
          <section className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Step 2: Profil Produk</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:col-span-2">
                Nama Produk
                <input
                  type="text"
                  value={onboardingData.product.productName}
                  onChange={(e) => updateOnboardingField('product', 'productName', e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:col-span-2">
                Deskripsi Produk
                <textarea
                  rows={4}
                  value={onboardingData.product.productDescription}
                  onChange={(e) =>
                    updateOnboardingField('product', 'productDescription', e.target.value)
                  }
                  onBlur={handleClassifyHSCode}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
                  placeholder="Tuliskan deskripsi detail untuk memicu AI HS Code Classifier"
                />
              </label>

              {(classifyingHS || onboardingData.product.hsStatus === 'loading') && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-primary md:col-span-2">
                  <LoaderCircle size={16} className="animate-spin" />
                  AI sedang mengklasifikasi...
                </div>
              )}

              {onboardingData.product.hsStatus === 'success' && (
                <div className="md:col-span-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-primary">
                    Kode HS: {onboardingData.product.hsCode}
                  </span>
                </div>
              )}

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Kapasitas Produksi / Bulan
                <input
                  type="text"
                  value={onboardingData.product.monthlyCapacity}
                  onChange={(e) => updateOnboardingField('product', 'monthlyCapacity', e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                MOQ (Minimum Order Quantity)
                <input
                  type="text"
                  value={onboardingData.product.moq}
                  onChange={(e) => updateOnboardingField('product', 'moq', e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:col-span-2">
                Rentang Harga (USD)
                <input
                  type="text"
                  value={onboardingData.product.priceRangeUsd}
                  onChange={(e) => updateOnboardingField('product', 'priceRangeUsd', e.target.value)}
                  placeholder="Contoh: USD 4.5 - 6.0 per kg"
                  className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
                />
              </label>

              <label className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-medium text-slate-700 md:col-span-2">
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <Upload size={16} /> Upload foto produk
                </span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {onboardingData.product.photoName && (
                  <p className="text-xs text-slate-500">{onboardingData.product.photoName}</p>
                )}
              </label>

              {onboardingData.product.photoPreview && (
                <img
                  src={onboardingData.product.photoPreview}
                  alt="Preview produk"
                  className="h-56 w-full rounded-xl border border-slate-200 object-cover md:col-span-2"
                />
              )}
            </div>
          </section>
        )}

        {currentStep === 3 && (
          <section className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Step 3: Kapabilitas Ekspor</h2>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={onboardingData.exportCapability.hasExportExperience}
                onChange={(e) =>
                  updateOnboardingField('exportCapability', 'hasExportExperience', e.target.checked)
                }
              />
              Memiliki pengalaman ekspor sebelumnya
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Kesiapan logistik
              <select
                value={onboardingData.exportCapability.logisticsReadiness}
                onChange={(e) =>
                  updateOnboardingField('exportCapability', 'logisticsReadiness', e.target.value)
                }
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
              >
                <option value="Darat">Darat</option>
                <option value="Laut">Laut</option>
                <option value="Udara">Udara</option>
              </select>
            </label>

            <fieldset className="rounded-xl border border-slate-200 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-700">Sertifikasi yang dimiliki</legend>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {certificationsList.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={onboardingData.exportCapability.certifications.includes(item)}
                      onChange={() => toggleCertification(item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Metode pembayaran yang diterima
              <select
                value={onboardingData.exportCapability.paymentMethod}
                onChange={(e) => updateOnboardingField('exportCapability', 'paymentMethod', e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
              >
                <option value="T/T">T/T</option>
                <option value="L/C">L/C</option>
                <option value="DP 30%">DP 30%</option>
              </select>
            </label>
          </section>
        )}

        {currentStep === 4 && (
          <section className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Step 4: Review & Submit</h2>
            <article className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">Legalitas</p>
                <p className="mt-1 font-semibold">NIB: {onboardingData.legal.nib || '-'}</p>
                <p>Nama Usaha: {onboardingData.legal.businessName || '-'}</p>
                <p>KBLI: {onboardingData.legal.kbli || '-'}</p>
                <p>Skala: {onboardingData.legal.businessScale || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">Produk</p>
                <p className="mt-1 font-semibold">Nama: {onboardingData.product.productName || '-'}</p>
                <p>Kode HS: {onboardingData.product.hsCode || '-'}</p>
                <p>Kapasitas: {onboardingData.product.monthlyCapacity || '-'}</p>
                <p>MOQ: {onboardingData.product.moq || '-'}</p>
                <p>Harga: {onboardingData.product.priceRangeUsd || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">Kapabilitas Ekspor</p>
                <p className="mt-1">
                  Pengalaman ekspor: {onboardingData.exportCapability.hasExportExperience ? 'Ya' : 'Belum'}
                </p>
                <p>Logistik: {onboardingData.exportCapability.logisticsReadiness}</p>
                <p>Pembayaran: {onboardingData.exportCapability.paymentMethod}</p>
                <p>
                  Sertifikasi: {onboardingData.exportCapability.certifications.join(', ') || 'Belum ada'}
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-slate-700">Verified UMKM Profile Score</p>
              <p className="mt-1 text-2xl font-extrabold text-primary">{animatedScore}/100</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${animatedScore}%` }}
                />
              </div>
            </article>
          </section>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kembali
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
            >
              Lanjut
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Mulai Cari Pembeli
            </button>
          )}
        </div>
        </form>
        <div className="mx-auto w-full max-w-4xl">
          <AppFooter />
        </div>
      </main>
    </PageTransition>
  )
}

export default Onboarding