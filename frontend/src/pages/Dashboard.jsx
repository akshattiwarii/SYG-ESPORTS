function Dashboard({ loggedIn, user, registrations, openAuth }) {
  
  if (!loggedIn) {
    return (
      <section className="section section-top">
        <div className="wrap">
          <div className="panel" style={{ padding: '40px 24px', textAlign: 'center', maxWidth: '540px', margin: '40px auto' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔑</div>
            <h3 style={{ fontSize: '22px', marginBottom: '12px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, textTransform: 'uppercase' }}>
              Player Account Required
            </h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: '24px', lineHeight: '1.6', fontSize: '14.5px' }}>
              Please log in or create a SYG ESPORTS player account to view your registrations, match statistics, and tournament history.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button className="btn btn-primary btn-sm" onClick={() => openAuth('login')}>Log In</button>
              <button className="btn btn-ghost btn-sm" onClick={() => openAuth('signup')}>Create Account</button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const initials = (str) => {
    return (str || 'PL')
      .replace(/[^A-Za-z0-9 ]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('') || 'PL'
  }
  
  const stats = user.stats || { matches: 0, wins: 0, points: 0, rank: '—' }
  const history = user.history || []

  return (
    <section className="section section-top">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Your Lane</span>
            <h2 className="section-title">Dashboard</h2>
            <div className="section-sub">Track your registrations, live status and upcoming events in one place.</div>
          </div>
        </div>

        <div className="dash-grid">
          <div className="dash-sidebar panel">
            <div className="dash-profile">
              <div className="dash-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user.avatar ? (
                  <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                ) : (
                  initials(user.ign || user.name)
                )}
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '2px', color: 'var(--text)' }}>
                {user.ign || 'Player'}
              </h3>
              <p style={{ color: 'var(--cyan)', fontSize: '12.5px', marginBottom: '8px', fontWeight: 600 }}>
                @{user.email ? user.email.split('@')[0] : 'user'}
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '6px' }}>
                {user.name || 'SYG ESPORTS Gamer'}
              </p>
              <p style={{ color: 'var(--text-faint)', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', userSelect: 'all' }}>
                UID: {user.uid || '—'}
              </p>
            </div>
            <div className="dash-nav">
              <a className="active" style={{ cursor: 'default' }}>📋 Registrations</a>
              <a style={{ cursor: 'default', opacity: 0.5 }}>🏆 Scrim Status</a>
            </div>
          </div>

          <div>
            <div className="kpi-row" id="dashKpiRow">
              <div className="kpi panel">
                <div className="kpi-label">Matches</div>
                <div className="kpi-value mono">{stats.matches}</div>
              </div>
              <div className="kpi panel">
                <div className="kpi-label">Wins</div>
                <div className="kpi-value mono" style={{ color: 'var(--green)' }}>{stats.wins}</div>
              </div>
              <div className="kpi panel">
                <div className="kpi-label">Points</div>
                <div className="kpi-value mono" style={{ color: 'var(--orange-2)' }}>{stats.points}</div>
              </div>
              <div className="kpi panel">
                <div className="kpi-label">Season Rank</div>
                <div className="kpi-value mono" style={{ color: 'var(--gold)' }}>{stats.rank}</div>
              </div>
            </div>

            <div className="panel" style={{ padding: '22px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Your Registrations</h3>
              <div id="dashRegistrations" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {registrations.map((r) => (
                  <div className="panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', background: 'var(--panel-2)', border: '1px solid var(--border)' }} key={r.id}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.tournament_title}</div>
                      <div style={{ color: 'var(--text-faint)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                        {r.reg_id} · {r.mode}
                      </div>
                    </div>
                    <span className={`badge ${r.verified ? 'badge-open' : 'badge-upcoming'}`}>
                      <span className="badge-dot"></span>{r.verified ? 'Verified' : 'Pending OTP'}
                    </span>
                  </div>
                ))}
                {registrations.length === 0 && (
                  <div className="empty">
                    <div className="eb">📋</div>
                    <h4>No registrations yet</h4>
                    <p>Join a tournament to see it here.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="panel" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Recent Activity</h3>
              <div className="table-scroll">
                <table className="ltable">
                  <thead>
                    <tr>
                      <th>Tournament</th>
                      <th>Mode</th>
                      <th>Placement</th>
                      <th>Kills</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody id="dashHistory">
                    {history.map((r, i) => (
                      <tr key={i}>
                        <td>{r.tournament_title}</td>
                        <td>{r.mode}</td>
                        <td className="numcell" style={{ fontWeight: 600, color: r.placement === 1 ? 'var(--gold)' : 'var(--text)' }}>
                          #{r.placement}
                        </td>
                        <td className="numcell">{r.kills}</td>
                        <td className="numcell" style={{ color: 'var(--orange-2)', fontWeight: 700 }}>
                          {r.points}
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '24px 0' }}>
                          No matches played yet. Participate in tournaments to see results here!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard
