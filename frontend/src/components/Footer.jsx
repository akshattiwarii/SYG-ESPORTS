function Footer({ setActivePage }) {
  const handleNavClick = (page) => {
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <img src="/syg_logo.jpg" alt="SYG ESPORTS" style={{ height: '32px', borderRadius: '4px', marginRight: '8px' }} />
              <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#ffffff', fontFamily: "'Rajdhani', sans-serif" }}>
                SYG ESPORTS
              </div>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: '1.6', maxWidth: '280px' }}>
              A community-run Free Fire esports platform. Weekly tournaments, verified results, real prizes.
            </p>
          </div>
          <div>
            <h5>Platform</h5>
            <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('tournaments')}>Tournaments</a>
            <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('leaderboard')}>Leaderboard</a>
            <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('rules')}>Rules</a>
            <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('community')}>Community</a>
          </div>
          <div>
            <h5>Support</h5>
            <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('contact')}>Contact Us</a>
            <a style={{ cursor: 'pointer' }} onClick={() => handleNavClick('rules')}>Fair Play Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} SYG ESPORTS. All Rights Reserved.</div>
          <div style={{ color: 'var(--text-faint)' }}>Designed for the gaming community.</div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
