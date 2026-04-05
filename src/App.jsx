import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import BuyerDiscovery from './pages/BuyerDiscovery'
import Dashboard from './pages/Dashboard'
import DealCommunication from './pages/DealCommunication'
import DealReadiness from './pages/DealReadiness'
import NotFound from './pages/NotFound'
import Onboarding from './pages/Onboarding'

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/buyer-discovery" element={<BuyerDiscovery />} />
        <Route path="/deal-communication" element={<DealCommunication />} />
        <Route path="/deal-readiness" element={<DealReadiness />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App