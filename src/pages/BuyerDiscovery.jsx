import confetti from 'canvas-confetti'
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import BuyerCard from '../components/BuyerCard'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'
import mockBuyers from '../data/mockBuyers'
import useUMKMStore from '../store/useUMKMStore'

const api = axios.create({
  baseURL: 'https://api.tradeconnect.local',
  timeout: 5000,
})

void api

function BuyerDiscovery() {
  const setSelectedBuyer = useUMKMStore((state) => state.setSelectedBuyer)
  const [isLoading, setIsLoading] = useState(true)
  const [contactedMap, setContactedMap] = useState({})

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 650)
    return () => clearTimeout(timer)
  }, [])

  const handleContact = (buyerId, buyerName) => {
    const isFirstContact = !contactedMap[buyerId]
    setSelectedBuyer(buyerId)
    setContactedMap((prev) => ({ ...prev, [buyerId]: true }))

    if (isFirstContact) {
      confetti({
        particleCount: 60,
        spread: 52,
        origin: { y: 0.75 },
        colors: ['#1D4ED8', '#0F766E', '#F59E0B'],
      })
      toast.success(`Buyer ${buyerName} berhasil dihubungi.`)
      return
    }

    toast('Buyer sudah pernah dihubungi sebelumnya.', { icon: 'ℹ️' })
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <LoadingSkeleton lines={4} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <LoadingSkeleton lines={4} />
          <LoadingSkeleton lines={4} />
          <LoadingSkeleton lines={4} />
        </div>
      </section>
    )
  }

  return (
    <section>
      <header className="mb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Cari Pembeli</h1>
        <p className="text-sm text-slate-600">Direktori buyer potensial berdasarkan kecocokan produk UMKM.</p>
      </header>

      {mockBuyers.length === 0 ? (
        <EmptyState
          title="Belum ada buyer yang cocok"
          description="Perbarui data produk dan kapasitas Anda untuk membuka rekomendasi buyer baru."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {mockBuyers.map((buyer) => (
            <BuyerCard
              key={buyer.id}
              buyer={buyer}
              contacted={Boolean(contactedMap[buyer.id])}
              onContact={() => handleContact(buyer.id, buyer.company)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default BuyerDiscovery