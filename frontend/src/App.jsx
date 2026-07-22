import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Toast from './components/Toast'
import AuthModal from './components/AuthModal'
import RegistrationModal from './components/RegistrationModal'
import OtpModal from './components/OtpModal'
import ProfileModal from './components/ProfileModal'

// Pages
import Home from './pages/Home'
import Tournaments from './pages/Tournaments'
import Leaderboard from './pages/Leaderboard'
import Rules from './pages/Rules'
import Community from './pages/Community'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

function App() {
  const [activePage, setActivePage] = useState('home')
  
  // Auth state
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState({ name: 'Guest', uid: 'N/A', role: 'guest' })
  
  // Data state
  const [tournaments, setTournaments] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [winners, setWinners] = useState([
    { name: 'Raze', tournament: 'Weekend Brawl', mode: 'BR Squad', date: '19 Jul', prize: 1200 },
    { name: 'Miko', tournament: 'Solo Survivor', mode: 'BR Solo', date: '17 Jul', prize: 500 }
  ])
  const [stats, setStats] = useState({ matches: 24, players: 180, tournaments: 6, prize: 5000, winners: 8, community: 320 })

  // Toast notification state
  const [toast, setToast] = useState({ message: '', visible: false, type: 'success' })

  // Modals state
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })
  const [regModal, setRegModal] = useState({ open: false, tournamentId: null })
  const [otpModal, setOtpModal] = useState({ open: false, regId: null, otp: '', title: '' })
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, visible: true, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 3200)
  }

  const syncSession = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setLoggedIn(true)
        setUser({
          ...data.user,
          name: data.user.ign || data.user.email.split('@')[0],
          stats: data.stats,
          history: data.history
        })
      } else {
        setLoggedIn(false)
        setUser({ name: 'Guest', uid: 'N/A', role: 'guest' })
      }
    } catch (err) {
      console.warn('Sync session failed', err)
    }
  }

  const loadData = async () => {
    try {
      const period = 'weekly'
      const [tRes, rRes, lRes] = await Promise.all([
        fetch('/api/tournaments'),
        fetch('/api/registrations'),
        fetch(`/api/leaderboard?period=${period}&mode=all`)
      ])
      
      if (tRes.ok) {
        const tData = await tRes.json()
        setTournaments(tData.map(t => ({ ...t, slotsTotal: t.slots_total, slotsFilled: t.slots_filled })))
      }
      
      if (rRes.ok) {
        const rData = await rRes.json()
        setRegistrations(rData)
      }

      if (lRes.ok) {
        const lData = await lRes.json()
        setLeaderboard(lData)
        if (Array.isArray(lData)) {
          // Strictly filter ONLY players who have actually won at least 1 match or prize money
          const actualWinners = lData.filter(p => Number(p.wins) > 0 || Number(p.prize) > 0)
          const champs = actualWinners.slice(0, 4).map((p) => ({
            name: p.name || p.ign || 'Esports Gamer',
            avatar: p.avatar || '',
            tournament: p.last_tournament || 'SYG Championship',
            mode: p.mode || 'BR Squad',
            date: 'Recent',
            prize: Number(p.prize || 0)
          }))
          setWinners(champs)
        }
      }
    } catch (err) {
      console.warn('Load data failed', err)
    }
  }

  useEffect(() => {
    // Initial load
    const init = async () => {
      await syncSession()
      await loadData()
    }
    init()
  }, [])

  // Sync data again whenever login status changes
  useEffect(() => {
    loadData()
  }, [loggedIn])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setLoggedIn(false)
      setUser({ name: 'Guest', uid: 'N/A', role: 'guest' })
      showToast('You have been logged out')
      setActivePage('home')
    } catch (err) {
      showToast('Logout request failed')
    }
  }

  const openAuth = (mode = 'login') => {
    setAuthModal({ open: true, mode })
  }

  const handleOpenRegistration = (tournamentId) => {
    setRegModal({ open: true, tournamentId })
  }

  // Page switching router
  // HTML5 History & Mobile Navigation helper
  const navigateTo = (page, pushToHistory = true) => {
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (pushToHistory) {
      const stateObj = { page }
      const url = page === 'home' ? '/' : `#${page}`
      window.history.pushState(stateObj, '', url)
    }
  }

  // Handle phone physical Back button & browser navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && ['tournaments', 'leaderboard', 'rules', 'community', 'contact', 'dashboard', 'admin'].includes(hash)) {
      setActivePage(hash)
    }

    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setActivePage(event.state.page)
      } else {
        const h = window.location.hash.replace('#', '')
        setActivePage(h || 'home')
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <Home 
            tournaments={tournaments} 
            leaderboard={leaderboard} 
            winners={winners} 
            stats={stats}
            openRegistration={handleOpenRegistration} 
            setActivePage={navigateTo}
          />
        )
      case 'tournaments':
        return (
          <Tournaments 
            tournaments={tournaments} 
            openRegistration={handleOpenRegistration} 
          />
        )
      case 'leaderboard':
        return (
          <Leaderboard 
            leaderboard={leaderboard} 
            setLeaderboard={setLeaderboard} 
          />
        )
      case 'rules':
        return <Rules />
      case 'community':
        return <Community setActivePage={navigateTo} />
      case 'contact':
        return <Contact showToast={showToast} />
      case 'dashboard':
        return (
          <Dashboard 
            loggedIn={loggedIn} 
            user={user} 
            registrations={registrations} 
            openAuth={openAuth}
          />
        )
      case 'admin':
        return (
          <Admin 
            loggedIn={loggedIn} 
            user={user} 
            tournaments={tournaments} 
            registrations={registrations} 
            openAuth={openAuth}
            refreshData={loadData}
            showToast={showToast}
          />
        )
      default:
        return <Home tournaments={tournaments} leaderboard={leaderboard} winners={winners} stats={stats} openRegistration={handleOpenRegistration} setActivePage={navigateTo} />
    }
  }

  return (
    <>
      <Navbar 
        activePage={activePage} 
        setActivePage={navigateTo} 
        loggedIn={loggedIn} 
        user={user} 
        handleLogout={handleLogout}
        openAuth={openAuth}
        openProfile={() => setProfileModalOpen(true)}
      />
      
      {activePage !== 'home' && (
        <div 
          style={{ 
            background: 'var(--panel)', 
            borderBottom: '1px solid var(--border)', 
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: 'var(--orange-2)',
            fontWeight: 600,
            fontSize: '13.5px',
            maxWidth: '1200px',
            margin: '0 auto',
            paddingLeft: '24px'
          }}
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back()
            } else {
              navigateTo('home')
            }
          }}
        >
          <span>←</span> Back
        </div>
      )}
      
      {renderPage()}

      <Footer setActivePage={navigateTo} />
      
      {toast.visible && <Toast message={toast.message} type={toast.type} />}

      {authModal.open && (
        <AuthModal 
          mode={authModal.mode} 
          setMode={(mode) => setAuthModal(prev => ({ ...prev, mode }))}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          syncSession={syncSession}
          showToast={showToast}
          setActivePage={setActivePage}
        />
      )}

      {regModal.open && (
        <RegistrationModal 
          tournamentId={regModal.tournamentId}
          tournaments={tournaments}
          loggedIn={loggedIn}
          user={user}
          onClose={() => setRegModal({ open: false, tournamentId: null })}
          showToast={showToast}
          refreshData={loadData}
          triggerOtp={(regId, otp, title) => setOtpModal({ open: true, regId, otp, title })}
        />
      )}

      {otpModal.open && (
        <OtpModal 
          regId={otpModal.regId}
          otp={otpModal.otp}
          title={otpModal.title}
          onClose={() => setOtpModal({ open: false, regId: null, otp: '', title: '' })}
          showToast={showToast}
          refreshData={loadData}
        />
      )}
      {profileModalOpen && (
        <ProfileModal 
          user={user}
          syncSession={syncSession}
          showToast={showToast}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </>
  )
}

export default App
