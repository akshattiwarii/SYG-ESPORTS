import { useState, useEffect } from 'react'

const MODES = ['BR Squad', 'BR Solo', 'BR Duo', 'Lone Wolf', 'Clash Squad']
const STATUSES = ['Open', 'Filling Fast', 'Upcoming', 'Full', 'Live', 'Completed']

function Admin({ loggedIn, user, tournaments, registrations, openAuth, refreshData, showToast }) {
  const [acTitle, setAcTitle] = useState('')
  const [acMode, setAcMode] = useState('BR Squad')
  const [acStatus, setAcStatus] = useState('Open')
  const [acPrize, setAcPrize] = useState('')
  const [acFee, setAcFee] = useState('')
  const [acSlots, setAcSlots] = useState('')
  const [acDate, setAcDate] = useState('')
  const [acTime, setAcTime] = useState('')
  const [creating, setCreating] = useState(false)

  // Declare Results state
  const [selectedTournamentId, setSelectedTournamentId] = useState('')
  const [resultsInput, setResultsInput] = useState([])
  const [submittingResults, setSubmittingResults] = useState(false)

  // Contacts Console state
  const [activeTab, setActiveTab] = useState('tournaments')
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  // Room Coordinates State
  const [roomModal, setRoomModal] = useState({ open: false, tournamentId: '', title: '', roomId: '', roomPass: '', roomNotes: '' })

  const isAccessGranted = loggedIn && user && user.role === 'admin'

  // Update results form structure when selected tournament changes
  useEffect(() => {
    if (!selectedTournamentId) {
      setResultsInput([])
      return
    }
    
    const regs = registrations.filter(r => r.tournament_id === selectedTournamentId && r.verified)
    const initial = regs.map((r, idx) => {
      let players = []
      try {
        players = JSON.parse(r.players_json || '[]')
      } catch (e) {
        console.error('Failed to parse players json in admin results initialization', e)
      }
      return {
        teamName: r.team_name || r.full_name,
        placement: idx + 1,
        prizeWon: 0,
        players: players.map(p => ({
          ign: p.ign,
          uid: p.uid,
          kills: 0
        }))
      }
    })
    setResultsInput(initial)
  }, [selectedTournamentId, registrations])

  if (!isAccessGranted) {
    return (
      <section className="section section-top">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">Operations</span>
              <h2 className="section-title">Admin Console</h2>
            </div>
          </div>
          <div className="panel" style={{ padding: '22px', background: 'rgba(255,140,0,0.08)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Admin access required</h3>
            <p style={{ margin: '0 0 20px', color: 'var(--text-dim)' }}>Sign in to unlock the control room and manage tournaments.</p>
            <button className="btn btn-primary btn-sm" onClick={() => openAuth('login')}>Sign In</button>
          </div>
        </div>
      </section>
    )
  }

  const fetchContacts = async () => {
    setLoadingContacts(true)
    try {
      const res = await fetch('/api/contacts')
      const json = await res.json()
      if (res.ok) {
        setContacts(json)
      }
    } catch (err) {
      console.error('Failed to fetch contact messages', err)
    } finally {
      setLoadingContacts(false)
    }
  }

  useEffect(() => {
    if (isAccessGranted) {
      fetchContacts()
    }
  }, [isAccessGranted])

  const handleResolveContact = async (id) => {
    try {
      const res = await fetch(`/api/contacts/${id}/resolve`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to resolve message')
      showToast('Message marked as resolved ✓')
      fetchContacts()
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error')
    }
  }

  const handleDeleteContact = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete message')
      showToast('Message deleted successfully ✓')
      fetchContacts()
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error')
    }
  }

  const handleOpenRoomModal = async (t) => {
    setRoomModal({
      open: true,
      tournamentId: t.id,
      title: t.title,
      roomId: '',
      roomPass: '',
      roomNotes: ''
    })
    try {
      const res = await fetch(`/api/tournaments/${t.id}/room`)
      if (res.ok) {
        const data = await res.json()
        setRoomModal(prev => ({
          ...prev,
          roomId: data.roomId || '',
          roomPass: data.roomPass || '',
          roomNotes: data.roomNotes || ''
        }))
      }
    } catch (err) {
      console.error('Failed to load room details', err)
    }
  }

  const handleSaveRoomDetails = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/admin/tournaments/${roomModal.tournamentId}/room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomModal.roomId,
          roomPass: roomModal.roomPass,
          roomNotes: roomModal.roomNotes
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update credentials')
      showToast('Lobby credentials updated successfully ✓')
      setRoomModal({ open: false, tournamentId: '', title: '', roomId: '', roomPass: '', roomNotes: '' })
      refreshData()
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error')
    }
  }

  const handleCreateTournament = async (e) => {
    e.preventDefault()
    if (!acTitle) return showToast('⚠ Title is required', 'error')

    setCreating(true)
    const payload = {
      title: acTitle,
      mode: acMode,
      status: acStatus,
      prize: Number(acPrize) || 0,
      fee: Number(acFee) || 0,
      slotsTotal: Number(acSlots) || 32,
      date: acDate || 'TBA',
      time: acTime || 'TBA'
    }

    try {
      const res = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Failed to create tournament')

      showToast('Tournament created successfully ✓')
      setAcTitle('')
      setAcPrize('')
      setAcFee('')
      setAcSlots('')
      setAcDate('')
      setAcTime('')
      await refreshData()
    } catch (err) {
      showToast(`⚠ ${err.message || 'Failed to create tournament'}`, 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleCycleStatus = async (id, currentStatus) => {
    const idx = STATUSES.indexOf(currentStatus)
    const nextStatus = STATUSES[(idx + 1) % STATUSES.length]

    try {
      const res = await fetch(`/api/admin/tournaments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to cycle status')
      }
      showToast(`Status updated to ${nextStatus}`)
      await refreshData()
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error')
    }
  }

  const handleDeleteTournament = async (id) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return

    try {
      const res = await fetch(`/api/admin/tournaments/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to delete tournament')
      }
      showToast('Tournament deleted successfully')
      await refreshData()
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error')
    }
  }

  const handleResultChange = (teamIndex, field, value) => {
    const updated = [...resultsInput]
    updated[teamIndex][field] = value
    setResultsInput(updated)
  }

  const handleKillsChange = (teamIndex, playerIndex, value) => {
    const updated = [...resultsInput]
    updated[teamIndex].players[playerIndex].kills = value
    setResultsInput(updated)
  }

  const handleDeclareResults = async (e) => {
    e.preventDefault()
    if (!selectedTournamentId) return

    setSubmittingResults(true)
    const results = []
    
    resultsInput.forEach(row => {
      row.players.forEach((p, pIdx) => {
        results.push({
          playerUid: p.uid,
          playerIgn: p.ign,
          teamName: row.teamName,
          placement: Number(row.placement) || 0,
          kills: Number(p.kills) || 0,
          prizeWon: pIdx === 0 ? Number(row.prizeWon) || 0 : 0
        })
      })
    })

    try {
      const res = await fetch('/api/admin/match-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId: selectedTournamentId, results })
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Failed to submit results')

      showToast('Results published & leaderboard updated ✓')
      setSelectedTournamentId('')
      await refreshData()
    } catch (err) {
      showToast(`⚠ ${err.message || 'Failed to submit results'}`, 'error')
    } finally {
      setSubmittingResults(false)
    }
  }

  const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
  const statusBadgeClass = (s) => {
    return { Open: 'badge-open', Full: 'badge-full', 'Filling Fast': 'badge-filling', Upcoming: 'badge-upcoming', Live: 'badge-live', Completed: 'badge-completed' }[s] || 'badge-full'
  }

  const selectedTourneyDetails = tournaments.find(t => t.id === selectedTournamentId)
  const currentVerifiedRegs = registrations.filter(r => r.tournament_id === selectedTournamentId && r.verified)

  return (
    <section className="section section-top">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Operations</span>
            <h2 className="section-title">Admin Console</h2>
            <div className="section-sub">Manage tournaments, registrations and match outcomes from the control room.</div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'tournaments' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setActiveTab('tournaments')}
            type="button"
          >
            🏆 Tournaments & Standings
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'contacts' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setActiveTab('contacts')}
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            📬 Contact Messages
            {contacts.length > 0 && contacts.filter(c => !c.resolved).length > 0 && (
              <span style={{ background: 'var(--red)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '99px', fontWeight: 'bold' }}>
                {contacts.filter(c => !c.resolved).length}
              </span>
            )}
          </button>
        </div>

        <div id="adminProtectedContent">
          {activeTab === 'tournaments' && (
            <>
          
          {/* Create Tournament */}
          <div className="panel" style={{ padding: '22px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Create Tournament</h3>
            <form onSubmit={handleCreateTournament}>
              <div className="field-row">
                <div className="field">
                  <label>Title</label>
                  <input type="text" value={acTitle} onChange={e => setAcTitle(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Mode</label>
                  <select value={acMode} onChange={e => setAcMode(e.target.value)}>
                    {MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Status</label>
                  <select value={acStatus} onChange={e => setAcStatus(e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Prize Pool</label>
                  <input type="number" placeholder="0" value={acPrize} onChange={e => setAcPrize(e.target.value)} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Entry Fee</label>
                  <input type="number" placeholder="0" value={acFee} onChange={e => setAcFee(e.target.value)} />
                </div>
                <div className="field">
                  <label>Total Slots</label>
                  <input type="number" placeholder="32" value={acSlots} onChange={e => setAcSlots(e.target.value)} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Date</label>
                  <input type="text" placeholder="27 Jul 2026" value={acDate} onChange={e => setAcDate(e.target.value)} />
                </div>
                <div className="field">
                  <label>Time</label>
                  <input type="text" placeholder="8:00 PM IST" value={acTime} onChange={e => setAcTime(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create Tournament'}
              </button>
            </form>
          </div>

          {/* Tournament Board */}
          <div className="panel" style={{ padding: '22px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Tournament Board</h3>
            <div className="table-scroll">
              <div className="admin-table-row head" style={{ minWidth: '600px' }}>
                <span>Title</span>
                <span>Mode</span>
                <span>Slots</span>
                <span>Prize</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              <div id="adminTournamentRows" style={{ minWidth: '600px' }}>
                {tournaments.map(t => (
                  <div className="admin-table-row" key={t.id}>
                    <span style={{ fontWeight: 600 }}>{t.title}</span>
                    <span className="mono" style={{ fontSize: '12px' }}>{t.mode}</span>
                    <span className="mono">{t.slotsFilled}/{t.slotsTotal}</span>
                    <span className="mono" style={{ color: 'var(--gold)' }}>{money(t.prize)}</span>
                    <span className={`badge ${statusBadgeClass(t.status)}`} style={{ width: 'fit-content' }}>
                      <span className="badge-dot"></span>{t.status}
                    </span>
                    <span style={{ display: 'flex', gap: '6px' }}>
                      <button className="icon-btn" title="Manage Room Info" onClick={() => handleOpenRoomModal(t)}>🔑</button>
                      <button className="icon-btn" title="Cycle Status" onClick={() => handleCycleStatus(t.id, t.status)}>↻</button>
                      <button className="icon-btn" title="Delete" onClick={() => handleDeleteTournament(t.id)}>🗑</button>
                    </span>
                  </div>
                ))}
                {tournaments.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-faint)' }}>
                    No tournaments created yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Declare Results & Standings */}
          <div className="panel" style={{ padding: '22px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Declare Tournament Results & Standings</h3>
            <div className="field">
              <label>Select Tournament</label>
              <select 
                id="resTournamentId" 
                className="select" 
                value={selectedTournamentId}
                onChange={e => setSelectedTournamentId(e.target.value)}
              >
                <option value="">-- Choose Live or Open Tournament --</option>
                {tournaments.map(t => (
                  <option value={t.id} key={t.id}>{t.title} ({t.mode} - {t.status})</option>
                ))}
              </select>
            </div>
            
            <div id="resFormContainer" className="panel-2" style={{ padding: '16px' }}>
              {!selectedTournamentId ? (
                <p style={{ color: 'var(--text-faint)', fontSize: '13px', margin: 0 }}>
                  Choose an active tournament to enter match scores and standings.
                </p>
              ) : currentVerifiedRegs.length === 0 ? (
                <p style={{ color: 'var(--red)', fontSize: '13px', margin: 0 }}>
                  ⚠ No verified registrations found for this tournament.
                </p>
              ) : (
                <form onSubmit={handleDeclareResults}>
                  <p style={{ color: 'var(--text-dim)', fontSize: '12.5px', marginBottom: '14px', lineHeight: '1.5' }}>
                    Enter placements (1 for winner, 2 for runner-up, etc.) and individual player kills. Standings points will be auto-calculated.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {resultsInput.map((row, teamIdx) => (
                      <div className="panel" style={{ padding: '16px', background: 'var(--panel)' }} key={teamIdx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--orange-2)', fontSize: '14.5px' }}>{row.teamName}</span>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <label style={{ fontSize: '10.5px', color: 'var(--text-faint)', transform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Placement</label>
                              <input 
                                type="number" 
                                min="1" 
                                value={row.placement} 
                                onChange={e => handleResultChange(teamIdx, 'placement', e.target.value)}
                                style={{ width: '56px', background: 'var(--panel-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', padding: '4px 6px', borderRadius: '6px', textAlign: 'center', fontSize: '12.5px' }}
                              />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <label style={{ fontSize: '10.5px', color: 'var(--text-faint)', transform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Prize ₹</label>
                              <input 
                                type="number" 
                                placeholder="0" 
                                value={row.prizeWon || ''}
                                onChange={e => handleResultChange(teamIdx, 'prizeWon', e.target.value)}
                                style={{ width: '78px', background: 'var(--panel-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', padding: '4px 6px', borderRadius: '6px', textAlign: 'center', fontSize: '12.5px' }}
                              />
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {row.players.map((p, playerIdx) => (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }} key={playerIdx}>
                              <span style={{ fontSize: '13px' }}>
                                {p.ign} <small style={{ color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace' }}>({p.uid})</small>
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Kills:</span>
                                <input 
                                  type="number" 
                                  min="0" 
                                  value={p.kills} 
                                  onChange={e => handleKillsChange(teamIdx, playerIdx, e.target.value)}
                                  style={{ width: '56px', background: 'var(--panel-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', padding: '4px 6px', borderRadius: '6px', textAlign: 'center', fontSize: '12.5px' }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px' }} disabled={submittingResults}>
                    {submittingResults ? 'Publishing...' : 'Declare Winner & Publish Standings'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Registrations List */}
          <div className="panel" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Registrations</h3>
            <div id="adminRegList" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {registrations.map(r => (
                <div className="panel-2" style={{ padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }} key={r.id}>
                  <div>
                    <b>{r.team_name || r.full_name}</b> 
                    <span style={{ color: 'var(--text-faint)', fontSize: '12px' }}> · {r.tournament_title} · {r.mode}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className={`badge ${r.verified ? 'badge-open' : 'badge-upcoming'}`}>{r.verified ? 'Verified' : 'Pending OTP'}</span>
                    <span className="mono" style={{ color: 'var(--text-faint)', fontSize: '12px' }}>{r.reg_id}</span>
                  </div>
                </div>
              ))}
              {registrations.length === 0 && (
                <div className="empty">
                  <div className="eb">📭</div>
                  <h4>No registrations yet</h4>
                </div>
              )}
            </div>
          </div>
        </>
      )}

          {activeTab === 'contacts' && (
            <div className="panel" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Submitted Inquiry Messages</h3>
                <button className="btn btn-ghost btn-sm" onClick={fetchContacts} disabled={loadingContacts} type="button">
                  {loadingContacts ? 'Refreshing...' : '↻ Refresh List'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {contacts.map(c => (
                  <div 
                    className="panel-2" 
                    style={{ 
                      padding: '18px', 
                      borderRadius: '12px', 
                      borderLeft: c.resolved ? '4px solid var(--text-faint)' : '4px solid var(--orange)',
                      opacity: c.resolved ? 0.75 : 1
                    }} 
                    key={c.id}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', color: 'var(--text)', fontWeight: 700, margin: '0 0 4px 0' }}>
                          {c.subject}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                          From: <b>{c.name}</b> (<a href={`mailto:${c.email}`} style={{ color: 'var(--cyan)' }}>{c.email}</a>)
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                          {new Date(c.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        {!c.resolved && (
                          <button 
                            className="btn btn-cyan btn-sm" 
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                            onClick={() => handleResolveContact(c.id)}
                            type="button"
                          >
                            ✓ Mark Resolved
                          </button>
                        )}
                        <button 
                          className="icon-btn" 
                          style={{ width: '26px', height: '26px' }}
                          title="Delete message"
                          onClick={() => handleDeleteContact(c.id)}
                          type="button"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                    <p style={{ 
                      background: 'rgba(0,0,0,0.18)', 
                      padding: '12px 14px', 
                      borderRadius: '8px', 
                      color: 'var(--text-dim)', 
                      fontSize: '13.5px', 
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      margin: 0
                    }}>
                      {c.message}
                    </p>
                  </div>
                ))}

                {contacts.length === 0 && (
                  <div className="empty">
                    <div className="eb">📬</div>
                    <h4>No messages received yet</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-faint)', marginTop: '4px' }}>
                      When users submit the contact form, their queries will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        {roomModal.open && (
          <div className="modal-backdrop" onClick={() => setRoomModal({ open: false, tournamentId: '', title: '', roomId: '', roomPass: '', roomNotes: '' })}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
              <div className="modal-head">
                <h3>Lobby Coordinates — {roomModal.title}</h3>
                <div className="modal-close" style={{ cursor: 'pointer' }} onClick={() => setRoomModal({ open: false, tournamentId: '', title: '', roomId: '', roomPass: '', roomNotes: '' })}>✕</div>
              </div>
              <form onSubmit={handleSaveRoomDetails}>
                <div className="modal-body">
                  <p style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: 1.4, marginBottom: '16px' }}>
                    Set the Custom Room ID and Password. Only verified registered participants will be able to unlock and view this data from their dashboards.
                  </p>
                  <div className="field-row">
                    <div className="field">
                      <label>Room ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 1234567" 
                        value={roomModal.roomId}
                        onChange={e => setRoomModal(prev => ({ ...prev, roomId: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label>Room Password</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 98765" 
                        value={roomModal.roomPass}
                        onChange={e => setRoomModal(prev => ({ ...prev, roomPass: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Special Instructions / Notes</label>
                    <textarea 
                      rows="3" 
                      placeholder="e.g. Lobby opens at 7:50 PM. Map: Bermuda. Do not share credentials!" 
                      value={roomModal.roomNotes}
                      onChange={e => setRoomModal(prev => ({ ...prev, roomNotes: e.target.value }))}
                      style={{ width: '100%', background: 'var(--panel-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', padding: '11px 13px', borderRadius: '9px', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
                <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setRoomModal({ open: false, tournamentId: '', title: '', roomId: '', roomPass: '', roomNotes: '' })}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Lobby Info</button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </section>
  )
}

export default Admin
