import { useState, useEffect } from 'react'

const MODES = ['BR Squad', 'BR Solo', 'BR Duo', 'Lone Wolf', 'Clash Squad']
const STATUSES = ['Open', 'Filling Fast', 'Upcoming', 'Full', 'Live', 'Completed']
const MODE_ICON = { 'BR Squad': '🛡️', 'BR Solo': '🎯', 'BR Duo': '⚔️', 'Lone Wolf': '🐺', 'Clash Squad': '💥' }

function Tournaments({ tournaments, openRegistration }) {
  const [selectedId, setSelectedId] = useState('')
  const [modeFilter, setModeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortFilter, setSortFilter] = useState('date')
  const [searchQuery, setSearchQuery] = useState('')

  // Set initial selected tournament to the first one available
  useEffect(() => {
    if (tournaments.length > 0 && !selectedId) {
      setSelectedId(tournaments[0].id)
    }
  }, [tournaments, selectedId])

  const selectedTournament = tournaments.find(t => t.id === selectedId)

  // Filters logic
  const filtered = tournaments
    .filter(t => {
      const matchesMode = modeFilter === 'all' || t.mode === modeFilter
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesMode && matchesStatus && matchesSearch
    })
    .sort((a, b) => {
      if (sortFilter === 'prize') return b.prize - a.prize
      if (sortFilter === 'fee') return a.fee - b.fee
      // Default date sorting (can treat t1, t2, etc. as simple chronological string ids or custom dates, let's keep array order or id sort)
      return a.date.localeCompare(b.date)
    })

  const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
  const statusBadgeClass = (s) => {
    return { Open: 'badge-open', Full: 'badge-full', 'Filling Fast': 'badge-filling', Upcoming: 'badge-upcoming', Live: 'badge-live', Completed: 'badge-completed' }[s] || 'badge-full'
  }

  return (
    <>
      <section className="section section-top">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Browse</span>
              <h2 className="section-title">Tournaments</h2>
            </div>
          </div>
          
          <div className="panel" style={{ padding: '22px', marginBottom: '24px' }}>
            <div className="filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', padding: 0, margin: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <select 
                  id="fMode" 
                  className="select" 
                  value={modeFilter} 
                  onChange={e => setModeFilter(e.target.value)}
                  style={{ background: 'var(--panel-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', padding: '9px 12px', borderRadius: '8px' }}
                >
                  <option value="all">All Modes</option>
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                
                <select 
                  id="fStatus" 
                  className="select" 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ background: 'var(--panel-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', padding: '9px 12px', borderRadius: '8px' }}
                >
                  <option value="all">All Statuses</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                
                <select 
                  id="fSort" 
                  className="select" 
                  value={sortFilter} 
                  onChange={e => setSortFilter(e.target.value)}
                  style={{ background: 'var(--panel-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', padding: '9px 12px', borderRadius: '8px' }}
                >
                  <option value="date">Sort by Date</option>
                  <option value="prize">Highest Prize</option>
                  <option value="fee">Lowest Fee</option>
                </select>
              </div>
              <input 
                id="fSearch" 
                className="input" 
                type="search" 
                placeholder="Search tournaments" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ maxWidth: '240px', background: 'var(--panel-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', padding: '9px 12px', borderRadius: '8px' }}
              />
            </div>
            <div className="section-head" style={{ marginTop: '16px', padding: 0, marginBottom: 0 }}>
              <span className="eyebrow" style={{ fontSize: '10.5px' }}>{filtered.length} TOURNAMENTS FOUND</span>
            </div>
          </div>

          <div className="grid-3" id="tournamentsList">
            {filtered.map((t) => {
              const pct = Math.round((t.slotsFilled / Math.max(t.slotsTotal, 1)) * 100)
              const disabled = ['Full', 'Completed', 'Live'].includes(t.status)
              const label = disabled ? (t.status === 'Full' ? 'Slots Full' : t.status === 'Completed' ? 'Completed' : 'In Progress') : 'Join Tournament'
              
              return (
                <div 
                  className={`tcard ${selectedId === t.id ? 'active-card' : ''}`} 
                  key={t.id} 
                  onClick={() => setSelectedId(t.id)}
                  style={{ cursor: 'pointer', border: selectedId === t.id ? '1px solid var(--orange)' : '1px solid var(--border)' }}
                >
                  <div className="tcard-top">
                    <span className="tcard-mode-icon">{MODE_ICON[t.mode] || '🎮'}</span>
                    <span className={`badge ${statusBadgeClass(t.status)}`}>
                      <span className="badge-dot"></span>{t.status}
                    </span>
                  </div>
                  <div className="tcard-body">
                    <div>
                      <div className="tcard-mode">{t.mode}</div>
                      <div className="tcard-title" style={{ fontSize: '17px', fontWeight: 700 }}>{t.title}</div>
                    </div>
                    <div className="tcard-stats">
                      <div>
                        <div className="stat-mini-label">Prize Pool</div>
                        <div className="stat-mini-value" style={{ color: 'var(--gold)', fontSize: '13.5px' }}>{money(t.prize)}</div>
                      </div>
                      <div>
                        <div className="stat-mini-label">Entry Fee</div>
                        <div className="stat-mini-value" style={{ fontSize: '13.5px' }}>{t.fee > 0 ? money(t.fee) : 'Free'}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
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
                      onClick={(e) => {
                        e.stopPropagation()
                        openRegistration(t.id)
                      }}
                    >
                      {label}
                    </button>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="empty" style={{ gridColumn: '1 / -1' }}>
                <div className="eb">🎮</div>
                <h4>No tournaments match those filters</h4>
                <p>Try a different mode, search query, or status.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedTournament && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="panel" id="detailContent" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '22px' }}>{selectedTournament.title}</h3>
                  <p style={{ color: 'var(--text-dim)', margin: '6px 0 0', fontSize: '13.5px' }}>
                    {selectedTournament.mode} · {selectedTournament.date} · {selectedTournament.time}
                  </p>
                </div>
                <span className={`badge ${statusBadgeClass(selectedTournament.status)}`}>
                  <span className="badge-dot"></span>{selectedTournament.status}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '22px' }}>
                <div className="panel-2" style={{ padding: '14px' }}>
                  <div className="stat-mini-label">Prize Pool</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gold)', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                    {money(selectedTournament.prize)}
                  </div>
                </div>
                <div className="panel-2" style={{ padding: '14px' }}>
                  <div className="stat-mini-label">Entry Fee</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                    {selectedTournament.fee > 0 ? money(selectedTournament.fee) : 'Free'}
                  </div>
                </div>
                <div className="panel-2" style={{ padding: '14px' }}>
                  <div className="stat-mini-label">Slots Filled</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cyan)', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                    {selectedTournament.slotsFilled} / {selectedTournament.slotsTotal}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>Rules & Format:</h4>
                <ul style={{ color: 'var(--text-dim)', fontSize: '13.5px', lineHeight: '1.75', paddingLeft: '20px' }}>
                  <li>Lobby details (Room ID and password) will be sent 15 minutes before the match start time.</li>
                  <li>All participating players must record their match clips or take screenshots of results.</li>
                  <li>Hacking, cheating, team-up, or third-party tools will trigger immediate disqualification.</li>
                  <li>Standings points will update the leaderboard automatically once results are published.</li>
                </ul>
              </div>

              <div style={{ marginTop: '22px', display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-primary" 
                  disabled={['Full', 'Completed', 'Live'].includes(selectedTournament.status)}
                  onClick={() => openRegistration(selectedTournament.id)}
                >
                  Register Now
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default Tournaments
