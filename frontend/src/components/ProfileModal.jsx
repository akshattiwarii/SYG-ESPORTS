import { useState, useRef } from 'react'

const PRESET_AVATARS = [
  { name: 'Phoenix', gradient: 'radial-gradient(circle, #ff4e50 0%, #f9d423 100%)' },
  { name: 'Frost', gradient: 'radial-gradient(circle, #00c6ff 0%, #0072ff 100%)' },
  { name: 'Venom', gradient: 'radial-gradient(circle, #00ff87 0%, #60efff 100%)' },
  { name: 'Gold', gradient: 'radial-gradient(circle, #ffe259 0%, #ffa751 100%)' },
  { name: 'Void', gradient: 'radial-gradient(circle, #8a2387 0%, #e94057 100%)' },
  { name: 'Ghost', gradient: 'radial-gradient(circle, #d7d2cc 0%, #304352 100%)' }
]

// Convert gradient name to base64 SVG representation to store in SQLite
const makeGradientSvgBase64 = (gradientStyle) => {
  const isRadial = gradientStyle.includes('radial-gradient')
  let svgContent = ''
  
  if (isRadial) {
    // Basic radial gradient matching the colors
    const colors = gradientStyle.match(/#[0-9a-fA-F]{3,6}/g) || ['#ff4e50', '#f9d423']
    svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${colors[0]}" />
            <stop offset="100%" stop-color="${colors[1]}" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#grad)" />
      </svg>
    `
  }
  
  return `data:image/svg+xml;base64,${btoa(svgContent.trim())}`
}

function ProfileModal({ user, syncSession, showToast, onClose }) {
  const [ign, setIgn] = useState(user.ign || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [discord, setDiscord] = useState(user.discord || '')
  const [avatar, setAvatar] = useState(user.avatar || '')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const systemUsername = user.email ? user.email.split('@')[0] : 'user'

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        return showToast('⚠ Image size must be less than 1MB', 'error')
      }
      const reader = new FileReader()
      reader.onload = () => {
        setAvatar(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelectPreset = (gradient) => {
    const base64Svg = makeGradientSvgBase64(gradient)
    setAvatar(base64Svg)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!ign.trim()) return showToast('⚠ IGN is required', 'error')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ign, phone, discord, avatar })
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Failed to update profile')

      showToast('Profile updated successfully! ✓')
      await syncSession()
      onClose()
    } catch (err) {
      showToast(`⚠ ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-head">
          <h3>Your Gamer Profile</h3>
          <div className="modal-close" style={{ cursor: 'pointer' }} onClick={onClose}>✕</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            
            {/* Avatar Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '22px' }}>
              <div 
                style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '50%', 
                  overflow: 'hidden', 
                  border: '3px solid var(--orange)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'var(--panel-2)',
                  fontSize: '28px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: 'var(--text)'
                }}
              >
                {avatar ? (
                  <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar Preview" />
                ) : (
                  initials(ign || user.name)
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Upload Photo
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                {avatar && (
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => setAvatar('')}
                    style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--red)', borderColor: 'var(--red)' }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Avatar Presets */}
              <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
                  Select Gaming Gradient
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {PRESET_AVATARS.map((preset, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelectPreset(preset.gradient)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: preset.gradient,
                        cursor: 'pointer',
                        border: '2px solid var(--border-strong)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.15)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Read-Only Username Credentials */}
            <div className="panel-2" style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block' }}>System Username</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cyan)' }}>{systemUsername}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', display: 'block' }}>Free Fire UID</span>
                <span style={{ fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-dim)' }}>{user.uid || 'N/A'}</span>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="field">
              <label>In-Game Name (IGN)</label>
              <input 
                type="text" 
                value={ign} 
                onChange={e => setIgn(e.target.value)} 
                required 
              />
            </div>
            
            <div className="field-row">
              <div className="field">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                />
              </div>
              <div className="field">
                <label>Discord / WhatsApp</label>
                <input 
                  type="text" 
                  value={discord} 
                  onChange={e => setDiscord(e.target.value)} 
                />
              </div>
            </div>

            <div className="field">
              <label>Email Address (Read-Only)</label>
              <input 
                type="email" 
                value={user.email || ''} 
                disabled 
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileModal
