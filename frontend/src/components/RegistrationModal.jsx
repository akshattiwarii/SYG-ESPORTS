import { useState, useEffect } from 'react'

function RegistrationModal({ tournamentId, tournaments, loggedIn, user, onClose, showToast, refreshData, triggerOtp }) {
  const t = tournaments.find(x => x.id === tournamentId)
  if (!t) return null

  // Determine roster size based on mode
  let playerCount = 1
  if (t.mode.includes('Squad') || t.mode.includes('Clash')) playerCount = 4
  else if (t.mode.includes('Duo')) playerCount = 2

  const isSolo = playerCount === 1

  // State fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [discord, setDiscord] = useState('')
  const [teamName, setTeamName] = useState('')
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)

  // Initialize roster state & prefill user details if logged in
  useEffect(() => {
    if (loggedIn && user) {
      setFullName(user.name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setDiscord(user.discord || '')
    }

    const initialPlayers = []
    for (let i = 0; i < playerCount; i++) {
      initialPlayers.push({
        ign: i === 0 && loggedIn ? (user.ign || '') : '',
        uid: i === 0 && loggedIn ? (user.uid || '') : ''
      })
    }
    setPlayers(initialPlayers)
  }, [loggedIn, user, playerCount])

  const handlePlayerChange = (index, field, value) => {
    const updated = [...players]
    updated[index][field] = value
    setPlayers(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate players
    for (let i = 0; i < playerCount; i++) {
      if (!players[i].ign || !players[i].uid) {
        return showToast(`⚠ Player #${i + 1} IGN and Free Fire UID are required`, 'error')
      }
    }

    if (!fullName || !email || !phone) {
      return showToast('⚠ Captain Name, Email and Phone are required', 'error')
    }

    const payload = {
      tournamentId,
      fullName,
      email,
      phone,
      discord,
      teamName: !isSolo ? teamName : players[0].ign,
      players
    }

    if (!isSolo && !teamName) {
      return showToast('⚠ Team Name is required for Duo/Squad tournaments', 'error')
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.error || 'Registration failed')

      showToast('Registration successful! ✓')
      onClose()
      await refreshData()
    } catch (err) {
      showToast(`⚠ ${err.message || 'Registration failed'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Register — {t.title}</h3>
          <div className="modal-close" style={{ cursor: 'pointer' }} onClick={onClose}>✕</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="field-row">
              <div className="field">
                <label>Captain / Registrant Name</label>
                <input 
                  type="text" 
                  placeholder="Real name" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  required
                />
              </div>
              <div className="field">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="you@email.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  placeholder="+91 9XXXXXXXXX" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  required
                />
              </div>
              <div className="field">
                <label>Discord / WhatsApp</label>
                <input 
                  type="text" 
                  placeholder="username#0000" 
                  value={discord} 
                  onChange={e => setDiscord(e.target.value)} 
                />
              </div>
            </div>

            {!isSolo && (
              <div className="field">
                <label>Team / Squad Name</label>
                <input 
                  type="text" 
                  placeholder="Enter team name" 
                  value={teamName} 
                  onChange={e => setTeamName(e.target.value)} 
                  required
                />
              </div>
            )}

            <h4 style={{ margin: '20px 0 12px', transform: 'uppercase', fontSize: '11.5px', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', color: 'var(--orange-2)' }}>
              Roster Details ({t.mode})
            </h4>

            {players.map((p, i) => {
              const isCapt = i === 0
              return (
                <div className="team-block" key={i}>
                  <h5>Player #{i + 1} {isCapt ? '(Captain)' : ''}</h5>
                  <div className="field-row">
                    <div className="field" style={{ marginBottom: 0 }}>
                      <label>In-Game Name (IGN)</label>
                      <input 
                        type="text" 
                        placeholder="IGN" 
                        value={p.ign} 
                        onChange={e => handlePlayerChange(i, 'ign', e.target.value)} 
                        required
                      />
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                      <label>Free Fire UID</label>
                      <input 
                        type="text" 
                        placeholder="UID" 
                        value={p.uid} 
                        onChange={e => handlePlayerChange(i, 'uid', e.target.value)} 
                        required
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegistrationModal
