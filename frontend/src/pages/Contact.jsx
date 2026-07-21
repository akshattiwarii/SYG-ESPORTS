import { useState } from 'react'

function Contact({ showToast }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('Support')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      return showToast('⚠ Please fill in all required fields', 'error')
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to submit message')

      showToast(json.message || 'Thank you! Your message has been sent successfully. ✓')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section section-top">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Support & Partnerships</span>
            <h2 className="section-title">Contact Us</h2>
            <div className="section-sub">Have questions about lobby timings, payments, or scrims? Send us a message.</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
          <div className="panel" style={{ flex: '1.2', padding: '24px', minWidth: '320px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '14px' }}>Send Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="field-row">
                <div className="field">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
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
              <div className="field">
                <label>Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)}>
                  <option value="Support">Lobby / Check-in Support</option>
                  <option value="Dispute">Match Score Dispute</option>
                  <option value="Business">Partnership / Scrim Request</option>
                </select>
              </div>
              <div className="field">
                <label>Message Details</label>
                <textarea 
                  rows="4" 
                  placeholder="Explain your query in detail..." 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  required
                  style={{ width: '100%', background: 'var(--panel-2)', border: '1px solid var(--border-strong)', color: 'var(--text)', padding: '11px 13px', borderRadius: '9px', fontFamily: 'inherit' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>

          <div style={{ flex: '0.8', display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '280px' }}>
            <div className="panel-2" style={{ padding: '20px' }}>
              <h4 style={{ color: 'var(--orange-2)', marginBottom: '8px' }}>Join Discord</h4>
              <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '12px' }}>
                Join our Discord server for instant lobby role assignments, room coordinates, and talk scrim rules with community mods.
              </p>
              <a href="https://discord.gg" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ borderColor: '#5865F2', color: '#5865F2' }}>
                Open Discord Server
              </a>
            </div>
            <div className="panel-2" style={{ padding: '20px' }}>
              <h4 style={{ color: 'var(--cyan)', marginBottom: '8px' }}>WhatsApp Scrim Groups</h4>
              <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '12px' }}>
                Recruiting active team leaders! Drop your contact in the form, and mods will add you to our official captains group.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
