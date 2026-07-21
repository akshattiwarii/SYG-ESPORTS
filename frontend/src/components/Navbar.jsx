import { useState, useRef, useEffect } from 'react'

function Navbar({ activePage, setActivePage, loggedIn, user, handleLogout, openAuth, openProfile }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleNavClick = (page) => {
    setActivePage(page)
    setMobileOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

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
          {loggedIn && <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('dashboard')}>Dashboard</a>}
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
