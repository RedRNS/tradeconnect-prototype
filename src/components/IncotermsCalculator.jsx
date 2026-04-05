import { useMemo, useState } from 'react'

const productBenchmarks = {
  Rattan: 11.5,
  Coffee: 7.8,
  Spices: 6.2,
  General: 5.5,
}

const ports = ['Tanjung Priok', 'Tanjung Perak', 'Belawan']

function formatUsd(value) {
  return Number(value || 0).toLocaleString('id-ID', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
}

function formatRp(value) {
  return Number(value || 0).toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
}

function IncotermsCalculator() {
  const [hppPerUnitRp, setHppPerUnitRp] = useState(120000)
  const [usdIdrRate, setUsdIdrRate] = useState(15800)
  const [truckingRp, setTruckingRp] = useState(3500000)
  const [thcRp, setThcRp] = useState(2500000)
  const [pebRp, setPebRp] = useState(1200000)
  const [unitsPerShipment, setUnitsPerShipment] = useState(500)
  const [originPort, setOriginPort] = useState('Tanjung Priok')
  const [oceanFreightUsd, setOceanFreightUsd] = useState(1600)
  const [incotermMode, setIncotermMode] = useState('FOB')
  const [productCategory, setProductCategory] = useState('Rattan')

  const insuranceRate = 0.003

  const pricing = useMemo(() => {
    const hpp = Number(hppPerUnitRp) || 0
    const rate = Number(usdIdrRate) || 1
    const trucking = Number(truckingRp) || 0
    const thc = Number(thcRp) || 0
    const peb = Number(pebRp) || 0
    const units = Math.max(Number(unitsPerShipment) || 1, 1)
    const oceanFreight = Number(oceanFreightUsd) || 0

    const hppUsd = hpp / rate
    const localCostRpPerUnit = (trucking + thc + peb) / units
    const localCostUsdPerUnit = localCostRpPerUnit / rate
    const exw = hppUsd
    const fob = hppUsd + localCostUsdPerUnit
    const cfr = fob + oceanFreight / units
    const cif = cfr * 1.1 * (1 + insuranceRate)

    return {
      exw,
      hppUsd,
      localCostRpPerUnit,
      localCostUsdPerUnit,
      FOB: fob,
      CFR: cfr,
      CIF: cif,
      selectedValue: { FOB: fob, CFR: cfr, CIF: cif }[incotermMode],
    }
  }, [hppPerUnitRp, usdIdrRate, truckingRp, thcRp, pebRp, unitsPerShipment, oceanFreightUsd, incotermMode])

  const chartSeries = [
    { label: 'EXW', value: pricing.exw, color: 'bg-slate-400' },
    { label: 'FOB', value: pricing.FOB, color: 'bg-primary' },
    { label: 'CFR', value: pricing.CFR, color: 'bg-secondary' },
    { label: 'CIF', value: pricing.CIF, color: 'bg-accent' },
  ]
  const maxChartValue = Math.max(...chartSeries.map((item) => item.value), 1)
  const benchmark = productBenchmarks[productCategory]
  const isUnderpriced = pricing.CIF < benchmark

  return (
    <section className="rounded-2xl border border-slate-200 bg-surface p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Kalkulator Harga Ekspor (Incoterms)</h3>
          <p className="mt-1 text-sm text-slate-500">
            Simulasi harga EXW, FOB, CFR, CIF secara real-time berbasis biaya aktual.
          </p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-primary">Incoterms 2020</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              HPP per unit (Rp)
              <input
                type="number"
                min="0"
                value={hppPerUnitRp}
                onChange={(event) => setHppPerUnitRp(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Kurs USD/IDR
              <input
                type="number"
                min="1"
                value={usdIdrRate}
                onChange={(event) => setUsdIdrRate(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Trucking ke Pelabuhan (Rp)
              <input
                type="number"
                min="0"
                value={truckingRp}
                onChange={(event) => setTruckingRp(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              THC (Rp)
              <input
                type="number"
                min="0"
                value={thcRp}
                onChange={(event) => setThcRp(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Biaya PEB/Dokumen (Rp)
              <input
                type="number"
                min="0"
                value={pebRp}
                onChange={(event) => setPebRp(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Jumlah unit dalam satu pengiriman: <span className="font-bold text-primary">{unitsPerShipment} unit</span>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={unitsPerShipment}
              onChange={(event) => setUnitsPerShipment(event.target.value)}
              className="accent-primary"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Pelabuhan Asal
              <select
                value={originPort}
                onChange={(event) => setOriginPort(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
              >
                {ports.map((port) => (
                  <option key={port} value={port}>
                    {port}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Ocean Freight / Kontainer (USD)
              <input
                type="number"
                min="0"
                value={oceanFreightUsd}
                onChange={(event) => setOceanFreightUsd(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Kategori Produk
              <select
                value={productCategory}
                onChange={(event) => setProductCategory(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 outline-none ring-primary/20 focus:ring"
              >
                <option value="Rattan">Rattan</option>
                <option value="Coffee">Coffee</option>
                <option value="Spices">Spices</option>
                <option value="General">General</option>
              </select>
            </label>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Pelabuhan Aktif</p>
              <p className="mt-1">{originPort}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['FOB', 'CFR', 'CIF'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setIncotermMode(mode)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  incotermMode === mode
                    ? 'bg-secondary text-white'
                    : 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">Nilai Aktif</p>
            <p className="mt-1 text-3xl font-extrabold text-primary">{formatUsd(pricing.selectedValue)}</p>
            <p className="text-xs text-slate-500">
              Mode: {incotermMode} | Kurs: 1 USD = {formatRp(usdIdrRate)}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-2">Komponen</th>
                  <th className="px-3 py-2">Nilai</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">HPP per unit (USD)</td>
                  <td className="px-3 py-2">{formatUsd(pricing.hppUsd)}</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">Biaya lokal per unit (Rp)</td>
                  <td className="px-3 py-2">{formatRp(pricing.localCostRpPerUnit)}</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">Harga FOB</td>
                  <td className="px-3 py-2">{formatUsd(pricing.FOB)}</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">Harga CFR</td>
                  <td className="px-3 py-2">{formatUsd(pricing.CFR)}</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">Harga CIF</td>
                  <td className="px-3 py-2">{formatUsd(pricing.CIF)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm font-semibold text-slate-900">Comparison Chart (USD/unit)</p>
            {chartSeries.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{item.label}</span>
                  <span>{formatUsd(item.value)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${(item.value / maxChartValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {isUnderpriced && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
              ⚠ Harga berada di bawah Export Unit Value rata-rata UN Comtrade. Risiko underpricing.
              <p className="mt-1 text-xs font-medium text-amber-800">
                Benchmark kategori {productCategory}: {formatUsd(benchmark)} per unit.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default IncotermsCalculator