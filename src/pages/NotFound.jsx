import { Link } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
import PageTransition from '../components/PageTransition'

function NotFound() {
  return (
    <PageTransition>
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">404</p>
        <h1 className="mt-1 text-4xl font-extrabold text-slate-900">Halaman Tidak Ditemukan</h1>
        <p className="mt-3 text-sm text-slate-600">
          Rute yang Anda buka tidak tersedia. Kembali ke dashboard untuk melanjutkan eksplorasi buyer.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </Link>
        </div>
        <AppFooter />
      </main>
    </PageTransition>
  )
}

export default NotFound