const MODE_ICON = { 'BR Squad': '🛡️', 'BR Solo': '🎯', 'BR Duo': '⚔️', 'Lone Wolf': '🐺', 'Clash Squad': '💥' }

function Home({ tournaments, leaderboard, winners, stats, openRegistration, setActivePage }) {
  const featured = tournaments.filter(t => ['Open', 'Filling Fast', 'Upcoming'].includes(t.status)).slice(0, 3)
  const top3 = leaderboard.slice(0, 3)

  const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
  const initials = (str) => {
    return (str || 'PL')
      .replace(/[^A-Za-z0-9 ]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('') || 'PL'
  }
  const statusBadgeClass = (s) => {
    return { Open: 'badge-open', Full: 'badge-full', 'Filling Fast': 'badge-filling', Upcoming: 'badge-upcoming', Live: 'badge-live', Completed: 'badge-completed' }[s] || 'badge-full'
  }

  return (
    <>
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="wrap hero-inner">
          <div>
            <span className="eyebrow">Season 4 · Registrations Open</span>
            <h1>Load in.<br />Loot up.<br /><span className="hi">Own the lobby.</span></h1>
            <p>
              SYG ESPORTS runs weekly Free Fire tournaments across BR Squad, Duo, Solo, Lone Wolf and Clash Squad — with real prize pools, a live leaderboard, and a community that actually watches the replays.
            </p>
            <div className="hero-ctas">
              <a className="btn btn-primary" onClick={() => setActivePage('tournaments')} style={{ cursor: 'pointer' }}>
                Explore Tournaments →
              </a>
              <a className="btn btn-ghost" onClick={() => setActivePage('leaderboard')} style={{ cursor: 'pointer' }}>
                View Leaderboard
              </a>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hp-header">
              <span className="eyebrow" style={{ color: 'var(--cyan)' }}>This Week's Top 3</span>
              <span className="badge badge-live"><span className="badge-dot"></span>Live</span>
            </div>
            <div className="hp-list">
              {top3.map((p, i) => (
                <div className="hp-row" key={i}>
                  <div className="hp-row-left">
                    <span className={`hp-rank r${p.rank}`}>#{p.rank}</span>
                    <div className="mini-avatar">{initials(p.name)}</div>
                    <div>
                      <div className="hp-name">{p.name}</div>
                      <div className="hp-sub">{p.wins} wins · {p.matches} matches</div>
                    </div>
                  </div>
                  <div className="hp-pts">{p.points.toLocaleString('en-IN')} pts</div>
                </div>
              ))}
              {top3.length === 0 && (
                <div style={{ color: 'var(--text-faint)', textAlign: 'center', padding: '12px 0' }}>No leaderboard data yet.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-num mono"><span>{stats.matches}</span>+</div>
              <div className="stat-lbl">Matches Hosted</div>
            </div>
            <div className="stat-item">
              <div className="stat-num mono"><span>{stats.players.toLocaleString('en-IN')}</span>+</div>
              <div className="stat-lbl">Players</div>
            </div>
            <div className="stat-item">
              <div className="stat-num mono"><span>{stats.tournaments}</span>+</div>
              <div className="stat-lbl">Tournaments</div>
            </div>
            <div className="stat-item">
              <div className="stat-num mono"><span>{money(stats.prize)}</span>+</div>
              <div className="stat-lbl">Prize Distributed</div>
            </div>
            <div className="stat-item">
              <div className="stat-num mono"><span>{stats.winners}</span>+</div>
              <div className="stat-lbl">Champions Crowned</div>
            </div>
            <div className="stat-item">
              <div className="stat-num mono"><span>{stats.community.toLocaleString('en-IN')}</span>+</div>
              <div className="stat-lbl">Community Members</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Right Now</span>
              <h2 className="section-title">Featured Tournaments</h2>
            </div>
            <a className="btn btn-ghost btn-sm" onClick={() => setActivePage('tournaments')} style={{ cursor: 'pointer' }}>
              See All Tournaments
            </a>
          </div>
          <div className="grid-3">
            {featured.map((t) => {
              const pct = Math.round((t.slotsFilled / Math.max(t.slotsTotal, 1)) * 100)
              const disabled = ['Full', 'Completed', 'Live'].includes(t.status)
              const label = disabled ? (t.status === 'Full' ? 'Slots Full' : t.status === 'Completed' ? 'Completed' : 'In Progress') : 'Join Tournament'
              
              return (
                <div className="tcard" key={t.id}>
                  <div className="tcard-top">
                    <span className="tcard-mode-icon">{MODE_ICON[t.mode] || '🎮'}</span>
                    <span className={`badge ${statusBadgeClass(t.status)}`}>
                      <span className="badge-dot"></span>{t.status}
                    </span>
                  </div>
                  <div className="tcard-body">
                    <div>
                      <div className="tcard-mode">{t.mode}</div>
                      <div className="tcard-title">{t.title}</div>
                    </div>
                    <div className="tcard-stats">
                      <div>
                        <div className="stat-mini-label">Prize Pool</div>
                        <div className="stat-mini-value" style={{ color: 'var(--gold)' }}>{money(t.prize)}</div>
                      </div>
                      <div>
                        <div className="stat-mini-label">Entry Fee</div>
                        <div className="stat-mini-value">{t.fee > 0 ? money(t.fee) : 'Free'}</div>
                      </div>
                      <div>
                        <div className="stat-mini-label">Date</div>
                        <div className="stat-mini-value" style={{ fontSize: '12.5px' }}>{t.date}</div>
                      </div>
                      <div>
                        <div className="stat-mini-label">Time</div>
                        <div className="stat-mini-value" style={{ fontSize: '12.5px' }}>{t.time}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
                        <span>{t.slotsFilled}/{t.slotsTotal} SLOTS</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="slot-bar">
                        <div className="slot-bar-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                    <button 
                      className={`btn ${disabled ? 'btn-ghost' : 'btn-primary'} btn-block btn-sm`} 
                      disabled={disabled}
                      onClick={() => openRegistration(t.id)}
                    >
                      {label}
                    </button>
                  </div>
                </div>
              )
            })}
            {featured.length === 0 && (
              <div className="empty" style={{ gridColumn: '1 / -1' }}>
                No active featured tournaments right now. Check back soon!
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="eyebrow">The Flow</span>
          <h2 className="section-title" style={{ marginBottom: '30px' }}>How It Works</h2>
          <div className="steps">
            <div className="step panel">
              <div className="step-num">01</div>
              <h4>Choose a Tournament</h4>
              <p>Filter by mode, prize pool or entry fee and find the lobby that fits your squad.</p>
            </div>
            <div className="step panel">
              <div className="step-num">02</div>
              <h4>Register Your Details</h4>
              <p>Drop your IGN, UID and squad info — the form adapts to Solo, Duo, Squad or Clash Squad.</p>
            </div>
            <div className="step panel">
              <div className="step-num">03</div>
              <h4>Get Your Slot</h4>
              <p>Instant confirmation with a registration ID. Room ID & password land before check-in.</p>
            </div>
            <div className="step panel">
              <div className="step-num">04</div>
              <h4>Compete & Win</h4>
              <p>Play it out, results get verified, and the leaderboard + prize pool update automatically.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="grid-3">
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              <div style={{ flex: '1.2', minWidth: '320px' }}>
                <span className="eyebrow">Podium Standings</span>
                <h2 className="section-title" style={{ marginBottom: '20px' }}>Top Lobbies Players</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} id="topPlayersPreview">
                  {top3.map((p, idx) => (
                    <div className="panel" style={{ padding: '20px' }} key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span className={`badge ${p.rank === 1 ? 'badge-filling' : 'badge-full'}`}>RANK #{p.rank}</span>
                        <span className="mono" style={{ color: 'var(--orange-2)', fontWeight: 700 }}>{p.points} pts</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                        <div className="podium-avatar" style={{ margin: 0 }}>{initials(p.name)}</div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{p.name}</div>
                          <div style={{ color: 'var(--text-faint)', fontSize: '12px' }}>{p.mode}</div>
                        </div>
                      </div>
                      <div className="tcard-stats">
                        <div>
                          <div className="stat-mini-label">Wins</div>
                          <div className="stat-mini-value">{p.wins}</div>
                        </div>
                        <div>
                          <div className="stat-mini-label">Matches</div>
                          <div className="stat-mini-value">{p.matches}</div>
                        </div>
                        <div>
                          <div className="stat-mini-label">Win Rate</div>
                          <div className="stat-mini-value">{Math.round((p.wins / Math.max(p.matches, 1)) * 100)}%</div>
                        </div>
                        <div>
                          <div className="stat-mini-label">Prize Won</div>
                          <div className="stat-mini-value" style={{ color: 'var(--gold)' }}>{money(p.prize)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: '0.8', minWidth: '300px' }}>
                <span className="eyebrow">Wall of Fame</span>
                <h2 className="section-title" style={{ marginBottom: '20px' }}>Recent Champions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} id="recentWinners">
                  {winners.length > 0 ? (
                    winners.map((w, idx) => (
                      <div className="winner-card panel" key={idx}>
                        <div className="winner-avatar">{initials(w.name)}</div>
                        <div>
                          <div className="winner-name">{w.name}</div>
                          <div className="winner-meta">{w.tournament} · {w.mode} · {w.date}</div>
                        </div>
                        <div className="winner-prize" style={{ marginLeft: 'auto', textAlign: 'right' }}>
                          <span className="badge badge-filling" style={{ marginBottom: '4px' }}>🏆 Champion</span>
                          <br />
                          <b>{money(w.prize)}</b>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '13.5px' }}>
                      🏆 No Champions Crowned Yet in Season 4
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
