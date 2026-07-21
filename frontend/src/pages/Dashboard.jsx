import { useState } from 'react'

function Dashboard({ loggedIn, user, registrations, openAuth }) {
  const [roomDetails, setRoomDetails] = useState({ open: false, tournamentTitle: '', roomId: '', roomPass: '', roomNotes: '', loading: false })

  const handleFetchRoomDetails = async (reg) => {
    setRoomDetails({
      open: true,
      tournamentTitle: reg.tournament_title,
      roomId: '',
      roomPass: '',
      roomNotes: '',
      loading: true
    })
    try {
      const res = await fetch(`/api/tournaments/${reg.tournament_id}/room`)
      if (res.ok) {
        const data = await res.json()
        setRoomDetails(prev => ({
          ...prev,
          roomId: data.roomId,
          roomPass: data.roomPass,
          roomNotes: data.roomNotes,
          loading: false
        }))
      } else {
        const json = await res.json()
        throw new Error(json.error || 'Failed to fetch details')
      }
    } catch (err) {
      setRoomDetails(prev => ({
        ...prev,
        loading: false,
        roomNotes: err.message || 'Lobby coordinates not available yet.'
      }))
    }
  }
  
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
              <div className="dash-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {user.avatar ? (
                  <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                ) : (
                  initials(user.ign || user.name)
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '2px', textAlign: 'left', flex: 1 }}>
                <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.ign || 'Player'}
                </h3>
                <p style={{ color: 'var(--cyan)', fontSize: '12.5px', margin: 0, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  @{user.email ? user.email.split('@')[0] : 'user'}
                </p>
                <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name || 'SYG ESPORTS Gamer'}
                </p>
                <p style={{ color: 'var(--text-faint)', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', userSelect: 'all', margin: 0 }}>
                  UID: {user.uid || '—'}
                </p>
              </div>
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
                  <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--panel-2)', border: '1px solid var(--border)' }} key={r.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{r.tournament_title}</div>
                        <div style={{ color: 'var(--text-faint)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                          {r.reg_id} · {r.mode}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cyan)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Slot Assigned: #{r.slot_number || '—'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {r.verified && (
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: '5px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', borderColor: 'var(--border-strong)' }}
                            onClick={() => handleFetchRoomDetails(r)}
                          >
                            🔑 Lobby Info
                          </button>
                        )}
                        <span className={`badge ${r.verified ? 'badge-open' : 'badge-upcoming'}`}>
                          <span className="badge-dot"></span>{r.verified ? 'Verified' : 'Pending OTP'}
                        </span>
                      </div>
                    </div>
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

      {roomDetails.open && (
        <div className="modal-backdrop" onClick={() => setRoomDetails(prev => ({ ...prev, open: false }))}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-head">
              <h3>Lobby Credentials</h3>
              <div className="modal-close" style={{ cursor: 'pointer' }} onClick={() => setRoomDetails(prev => ({ ...prev, open: false }))}>✕</div>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--text)', marginBottom: '4px' }}>{roomDetails.tournamentTitle}</h4>
              <p style={{ color: 'var(--text-dim)', fontSize: '12.5px', marginBottom: '16px' }}>
                Join the room using the credentials below. Do not share these coordinates with non-registered players.
              </p>

              {roomDetails.loading ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-dim)' }}>
                  Loading coordinates...
                </div>
              ) : (
                <>
                  {roomDetails.roomId || roomDetails.roomPass ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', background: 'var(--panel)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Custom Room ID</div>
                          <div className="mono" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cyan)' }}>{roomDetails.roomId || '—'}</div>
                        </div>
                        {roomDetails.roomId && (
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => {
                              navigator.clipboard.writeText(roomDetails.roomId)
                              alert('Room ID copied to clipboard! ✓')
                            }}
                          >
                            Copy
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', background: 'var(--panel)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Room Password</div>
                          <div className="mono" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--orange-2)' }}>{roomDetails.roomPass || '—'}</div>
                        </div>
                        {roomDetails.roomPass && (
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => {
                              navigator.clipboard.writeText(roomDetails.roomPass)
                              alert('Password copied to clipboard! ✓')
                            }}
                          >
                            Copy
                          </button>
                        )}
                      </div>

                      {roomDetails.roomNotes && (
                        <div style={{ background: 'rgba(43,224,232,0.1)', border: '1px solid rgba(43,224,232,0.2)', padding: '12px', borderRadius: '8px', fontSize: '12px', lineHeight: 1.5, color: 'var(--text)' }}>
                          <strong>Notes:</strong> {roomDetails.roomNotes}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px 0', textAlign: 'center' }}>
                      <span style={{ fontSize: '32px' }}>⏳</span>
                      <h5 style={{ margin: 0, fontSize: '14px' }}>Lobby Coordinates Pending</h5>
                      <p style={{ color: 'var(--text-dim)', fontSize: '12px', margin: 0 }}>
                        {roomDetails.roomNotes || 'The tournament host has not posted the Custom Room details yet. Please check back 10-15 minutes before the start time.'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px 20px' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setRoomDetails(prev => ({ ...prev, open: false }))}>Got it</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Dashboard
