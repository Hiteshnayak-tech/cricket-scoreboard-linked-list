import { Routes, Route, useLocation } from 'react-router-dom'
import { LinkedListProvider } from './context/LinkedListContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/public/HomePage'
import LinkedListVisualizer from './pages/admin/LinkedListVisualizer'
import TeamManagement from './pages/admin/TeamManagement'
import PlayerManagement from './pages/admin/PlayerManagement'
import LiveScoringConsole from './pages/admin/LiveScoringConsole'

function AppContent() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col bg-surface text-text-primary w-full">
      <Navbar />
      <main className="flex-1 w-full">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />

          {/* Admin Routes */}
          <Route path="/admin/teams" element={<TeamManagement />} />
          <Route path="/admin/players" element={<PlayerManagement />} />
          <Route path="/admin/scoring/:matchId" element={<LiveScoringConsole />} />
          <Route path="/admin/visualizer" element={<LinkedListVisualizer />} />
        </Routes>
      </main>
      {isHomePage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <LinkedListProvider>
      <AppContent />
    </LinkedListProvider>
  )
}

export default App
