function Community({ setActivePage }) {
  return (
    <section className="section section-top">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Stay Connected</span>
            <h2 className="section-title">Community Hub</h2>
            <div className="section-sub">The SYG Esports community grows through scrims, watch parties and local squad events.</div>
          </div>
          <a className="btn btn-primary btn-sm" onClick={() => setActivePage('contact')} style={{ cursor: 'pointer' }}>
            Get Involved
          </a>
        </div>
        <div className="grid-3">
          <div className="panel" style={{ padding: '22px' }}>
            <h4 style={{ marginBottom: '12px' }}>Weekly Scrims</h4>
            <p style={{ color: 'var(--text-dim)', lineHeight: '1.7' }}>
              Open practice lobbies every Friday night with host-led warmups, team comps and post-match breakdowns.
            </p>
          </div>
          <div className="panel" style={{ padding: '22px' }}>
            <h4 style={{ marginBottom: '12px' }}>Watch Party Nights</h4>
            <p style={{ color: 'var(--text-dim)', lineHeight: '1.7' }}>
              Live stream, voice chat and scoreboard overlays keep the action visible for every participant and fan.
            </p>
          </div>
          <div className="panel" style={{ padding: '22px' }}>
            <h4 style={{ marginBottom: '12px' }}>Player Spotlights</h4>
            <p style={{ color: 'var(--text-dim)', lineHeight: '1.7' }}>
              We highlight standout players, rising squads and community leaders every weekend.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Community
