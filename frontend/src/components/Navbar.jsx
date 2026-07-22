import { useState, useRef, useEffect } from 'react'

function Navbar({ activePage, setActivePage, loggedIn, user, handleLogout, openAuth, openProfile }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleNavClick = (page) => {
    setActivePage(page)
    setMobileOpen(false)
  }

  // Lock background body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [mobileOpen])

  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [pushGranted, setPushGranted] = useState(false)
  const notifRef = useRef(null)

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!loggedIn) return
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e)
    }
  }

  useEffect(() => {
    if (loggedIn) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 15000)
      return () => clearInterval(interval)
    }
  }, [loggedIn])

  useEffect(() => {
    if ('Notification' in window) {
      setPushGranted(Notification.permission === 'granted')
    }
  }, [])

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser push notifications are not supported on this device/browser.')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setPushGranted(true)
      try {
        new Notification('SYG ESPORTS 🏆', {
          body: 'Push notifications enabled! You will receive live alerts for match starts and winner declarations.',
          icon: '/syg_logo.jpg'
        })
      } catch (e) {}
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      setNotifications(prev => prev.map(n => ({ ...n, read_status: 1 })))
    } catch (e) {
      console.error('Failed to mark read all', e)
    }
  }

  const unreadNotifCount = notifications.filter(n => !n.read_status).length

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen, notifOpen])

  const initials = (str) => {
    return (str || 'PL')
      .replace(/[^A-Za-z0-9 ]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('') || 'PL'
  }

  return (
    <>
      <nav className="nav">
        <div className="wrap nav-inner">
          <a className="brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => handleNavClick('home')}>
            <img src="/syg_logo.jpg" alt="SYG ESPORTS" style={{ height: '38px', borderRadius: '4px', marginRight: '10px' }} />
            <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#ffffff', fontFamily: "'Rajdhani', sans-serif" }}>
              SYG ESPORTS
            </div>
          </a>
          <div className="nav-links">
            <a className={activePage === 'home' ? 'active' : ''} style={{ cursor: 'pointer' }} onClick={() => handleNavClick('home')}>Home</a>
            <a className={activePage === 'tournaments' ? 'active' : ''} style={{ cursor: 'pointer' }} onClick={() => handleNavClick('tournaments')}>Tournaments</a>
            <a className={activePage === 'leaderboard' ? 'active' : ''} style={{ cursor: 'pointer' }} onClick={() => handleNavClick('leaderboard')}>Leaderboard</a>
            <a className={activePage === 'rules' ? 'active' : ''} style={{ cursor: 'pointer' }} onClick={() => handleNavClick('rules')}>Rules</a>
            <a className={activePage === 'community' ? 'active' : ''} style={{ cursor: 'pointer' }} onClick={() => handleNavClick('community')}>Community</a>
            <a className={activePage === 'contact' ? 'active' : ''} style={{ cursor: 'pointer' }} onClick={() => handleNavClick('contact')}>Contact</a>
            <a href="https://web2apkpro.com/public_download.php?project_id=19997&token=b86bbd4da6" target="_blank" rel="noreferrer" style={{ color: 'var(--orange-2)', fontWeight: 700 }}>Download App 📱</a>
          </div>
          <div className="nav-cta">
            {loggedIn && (
              <a className={`btn btn-ghost btn-sm ${activePage === 'dashboard' ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => handleNavClick('dashboard')}>
                Dashboard
              </a>
            )}
            {loggedIn && user.role === 'admin' && (
              <a className={`btn btn-primary btn-sm ${activePage === 'admin' ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => handleNavClick('admin')}>
                Admin
              </a>
            )}

            {loggedIn && (
              <div className="nav-cta-notif" style={{ position: 'relative' }} ref={notifRef}>
                <button 
                  className="btn btn-ghost btn-sm notif-bell-btn"
                  onClick={() => {
                    setNotifOpen(!notifOpen)
                    if (!notifOpen) fetchNotifications()
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '15px' }}
                  title="Notifications"
                >
                  🔔
                  {unreadNotifCount > 0 && (
                    <span style={{ background: 'var(--orange)', color: '#160800', fontSize: '10px', fontWeight: 'bold', padding: '1px 5px', borderRadius: '99px' }}>
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'var(--panel)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                    zIndex: 1100,
                    width: '320px',
                    maxWidth: '90vw',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</div>
                      {unreadNotifCount > 0 && (
                        <span 
                          onClick={markAllRead} 
                          style={{ color: 'var(--cyan)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Mark all read ✓
                        </span>
                      )}
                    </div>

                    {/* Browser Push Permission Banner */}
                    {!pushGranted && (
                      <div style={{ padding: '10px 12px', background: 'rgba(255,145,0,0.1)', borderBottom: '1px solid var(--border)', fontSize: '11.5px', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div>Allow browser push notifications to get live alerts when matches start or when declared a winner!</div>
                        <button 
                          onClick={requestPushPermission} 
                          className="btn btn-primary btn-sm" 
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          🔔 Enable Push Notifications
                        </button>
                      </div>
                    )}

                    <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                      {notifications.map((n) => (
                        <div 
                          key={n.id}
                          style={{
                            padding: '12px 14px',
                            borderBottom: '1px solid var(--border)',
                            background: n.read_status ? 'transparent' : 'rgba(255,90,31,0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px'
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '13px', color: n.type === 'winner' ? 'var(--gold)' : 'var(--text)' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                            {new Date(n.created_at).toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'short' })}
                          </div>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-faint)', fontSize: '12.5px' }}>
                          🔔 No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {loggedIn ? (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button 
                  id="authBtn" 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', display: 'block', border: '1px solid var(--border)' }} 
                      alt="" 
                    />
                  ) : (
                    <span>{initials(user.ign || user.name)}</span>
                  )}
                  <span style={{ fontSize: '9px', opacity: 0.6 }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'var(--panel)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    minWidth: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    <a 
                      onClick={() => {
                        setDropdownOpen(false)
                        openProfile()
                      }} 
                      style={{
                        padding: '12px 16px',
                        color: 'var(--text)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.2s',
                        display: 'block'
                      }}
                      onMouseEnter={e => e.target.style.background = 'var(--panel-2)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      👤 Profile details
                    </a>
                    <a 
                      onClick={() => {
                        setDropdownOpen(false)
                        handleLogout()
                      }}
                      style={{
                        padding: '12px 16px',
                        color: 'var(--red)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'block'
                      }}
                      onMouseEnter={e => e.target.style.background = 'var(--panel-2)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      🚪 Logout
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <button 
                id="authBtn" 
                className="btn btn-ghost btn-sm"
                onClick={() => openAuth('login')}
              >
                Login
              </button>
            )}

            <button className="nav-toggle btn-ghost btn-sm" onClick={() => setMobileOpen(true)}>☰</button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-menu open" id="mobileMenu">
          <div className="mobile-close" style={{ cursor: 'pointer' }} onClick={() => setMobileOpen(false)}>✕</div>
          <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('home')}>Home</a>
          <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('tournaments')}>Tournaments</a>
          <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('leaderboard')}>Leaderboard</a>
          <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('rules')}>Rules</a>
          <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('community')}>Community</a>
          <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('contact')}>Contact</a>
          <a href="https://web2apkpro.com/public_download.php?project_id=19997&token=b86bbd4da6" target="_blank" rel="noreferrer" style={{ color: 'var(--orange-2)', fontWeight: 700 }}>Download App 📱</a>
          {loggedIn && <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('dashboard')}>Dashboard</a>}
          {loggedIn && (
            <a 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} 
              onClick={() => {
                setMobileOpen(false)
                setNotifOpen(true)
                fetchNotifications()
              }}
            >
              <span>🔔 Notifications</span>
              {unreadNotifCount > 0 && (
                <span style={{ background: 'var(--orange)', color: '#160800', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '99px' }}>
                  {unreadNotifCount} NEW
                </span>
              )}
            </a>
          )}
          {loggedIn && user.role === 'admin' && <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('admin')}>Admin</a>}
          {loggedIn && (
            <a 
              style={{ cursor: 'pointer' }} 
              onClick={() => {
                setMobileOpen(false)
                openProfile()
              }}
            >
              Profile details
            </a>
          )}
          <a 
            style={{ cursor: 'pointer', color: 'var(--orange-2)' }} 
            onClick={() => {
              setMobileOpen(false)
              loggedIn ? handleLogout() : openAuth('login')
            }}
          >
            {loggedIn ? 'Logout' : 'Sign In'}
          </a>
        </div>
      )}
    </>
  )
}

export default Navbar
