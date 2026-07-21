import { useState, useEffect } from 'react'

const MODES = ['BR Squad', 'BR Solo', 'BR Duo', 'Lone Wolf', 'Clash Squad']

function Leaderboard({ leaderboard, setLeaderboard }) {
  const [period, setPeriod] = useState('weekly')
  const [mode, setMode] = useState('all')
  const [loading, setLoading] = useState(false)

  // Fetch leaderboard data when filters change
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/leaderboard?period=${period}&mode=${mode}`)
        if (res.ok) {
          const data = await res.json()
          setLeaderboard(data)
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [period, mode, setLeaderboard])

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

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

  return (
    <section className="section section-top">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Season 4</span>
            <h2 className="section-title">Leaderboard</h2>
            <div className="section-sub">Ranked players, win rates and prize totals from the latest SYG Esports lobbies.</div>
          </div>
        </div>

        {/* Weekly Rewards Banner */}
        <div className="rule-warn" style={{ marginTop: '0', marginBottom: '24px', background: 'var(--cyan-soft)', border: '1px solid rgba(43,224,232,0.3)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🎁</span>
          <div>
            <strong>Weekly Leaderboard Rewards:</strong> The table topper (1st place) on the weekly leaderboard will be crowned the weekly champion and receive exciting cash prizes and premium rewards! Keep grinding lobbies to stay on top!
          </div>
        </div>

        <div className="filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '16px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: '26px', alignItems: 'center' }}>
          <select 
            id="lbMode" 
            className="select" 
            value={mode}
            onChange={e => setMode(e.target.value)}
            style={{ background: 'var(--panel-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', padding: '9px 12px', borderRadius: '8px' }}
          >
            <option value="all">All Modes</option>
            {MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          
          <button 
            className={`filter-chip ${period === 'weekly' ? 'active' : ''}`}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`filter-chip ${period === 'monthly' ? 'active' : ''}`}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`filter-chip ${period === 'season' ? 'active' : ''}`}
            onClick={() => setPeriod('season')}
          >
            Season
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>
            <div className="skel" style={{ width: '100%', height: '300px', borderRadius: '14px' }}></div>
          </div>
        ) : (
          <>
            <div id="podium" className="podium">
              {top3.map((p) => (
                <div className={`podium-card p${p.rank}`} key={p.uid}>
                  <div className="podium-rank">{p.rank}</div>
                  <div className="podium-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      initials(p.name)
                    )}
                  </div>
                  <div className="podium-name">{p.name}</div>
                  <div className="podium-meta">{p.mode} · {p.wins} wins</div>
                  <div className="podium-pts">{p.points.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            {leaderboard.length === 0 ? (
              <div className="empty">
                <div className="eb">🏆</div>
                <h4>No standings recorded yet</h4>
                <p>Submit match results in the Admin console to populate the leaderboard.</p>
              </div>
            ) : (
              <div className="panel" style={{ overflow: 'hidden' }}>
                <div className="table-scroll">
                  <table className="ltable">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Matches</th>
                        <th>Wins</th>
                        <th>Top 3</th>
                        <th>Kills</th>
                        <th>Points</th>
                        <th>Win Rate</th>
                        <th>Prize</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((p) => (
                        <tr key={p.uid}>
                          <td className="rankcell">#{p.rank}</td>
                          <td>
                            <div className="namecell">
                              <div className="mini-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {p.avatar ? (
                                  <img src={p.avatar} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  initials(p.name)
                                )}
                              </div>
                              {p.name}
                              <span style={{ color: 'var(--text-faint)', fontWeight: 400, fontSize: '11.5px', marginLeft: '4px' }}>
                                {p.mode}
                              </span>
                            </div>
                          </td>
                          <td className="numcell">{p.matches}</td>
                          <td className="numcell">{p.wins}</td>
                          <td className="numcell">{p.top3}</td>
                          <td className="numcell">{p.kills}</td>
                          <td className="numcell" style={{ color: 'var(--orange-2)', fontWeight: 700 }}>
                            {p.points.toLocaleString('en-IN')}
                          </td>
                          <td className="numcell">{Math.round((p.wins / Math.max(p.matches, 1)) * 100)}%</td>
                          <td className="numcell" style={{ color: 'var(--gold)' }}>{money(p.prize)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default Leaderboard
