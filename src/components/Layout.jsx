import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import AppFooter from './AppFooter'
import PageTransition from './PageTransition'
import Header from './Header'
import Sidebar from './Sidebar'

function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
          <AppFooter />
        </main>
      </div>
    </div>
  )
}

export default Layout