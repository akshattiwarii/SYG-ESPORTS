import { useState } from 'react'

function AuthModal({ mode, setMode, onClose, syncSession, showToast, setActivePage }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [ign, setIgn] = useState('')
  const [uid, setUid] = useState('')
  const [phone, setPhone] = useState('')
  const [discord, setDiscord] = useState('')
  const [loading, setLoading] = useState(false)

  // OTP Verification state
  const [userId, setUserId] = useState(null)
  const [otp, setOtp] = useState('')
  const [verificationCode, setVerificationCode] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (mode === 'verify') {
      if (!verificationCode.trim()) return showToast('⚠ Please enter the OTP code', 'error')

      setLoading(true)
      try {
        const res = await fetch('/api/auth/verify-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, otp: verificationCode })
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Verification failed')

        showToast('Account successfully verified! ✓')
        await syncSession()
        onClose()

        if (json.user.role === 'admin') {
          setActivePage('admin')
        } else {
          setActivePage('dashboard')
        }
      } catch (err) {
        showToast(`⚠ ${err.message || 'Verification failed'}`, 'error')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!email || !password) return showToast('⚠ Email and password required', 'error')

    let payload = { email, password }
    let url = '/api/auth/login'

    if (mode === 'signup') {
      if (!name || !ign || !uid) return showToast('⚠ Name, IGN, and UID are required', 'error')
      payload = { email, password, name, ign, uid, phone, discord }
      url = '/api/auth/signup'
    }

    setLoading(true)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      
      if (!res.ok) {
        if (res.status === 403 && json.verified === false) {
          setUserId(json.userId)
          setOtp(json.otp)
          setMode('verify')
          showToast('⚠ Verification required. Please enter the OTP.')
          return
        }
        throw new Error(json.error || 'Authentication failed')
      }

      if (json.verified === false) {
        setUserId(json.userId)
        setOtp(json.otp)
        setMode('verify')
        showToast('OTP generated. Enter it to verify account.')
        return
      }

      showToast(mode === 'login' ? `Welcome back, ${json.user.ign || 'Player'}!` : 'Account created successfully! ✓')
      
      await syncSession()
      onClose()

      if (json.user.role === 'admin') {
        setActivePage('admin')
      } else {
        setActivePage('dashboard')
      }
    } catch (err) {
      showToast(`⚠ ${err.message || 'Authentication failed'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const modalTitle = () => {
    if (mode === 'verify') return 'Verify Email Address'
    return mode === 'login' ? 'Login' : 'Create Player Account'
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{modalTitle()}</h3>
          <div className="modal-close" style={{ cursor: 'pointer' }} onClick={onClose}>✕</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {mode === 'verify' ? (
              <>
                <p style={{ marginBottom: '16px', fontSize: '13.5px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                  Enter the 6-digit OTP code to verify your profile email and activate your player account.
                </p>
                <div className="field">
                  <label>Verification OTP Code</label>
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={verificationCode} 
                    onChange={e => setVerificationCode(e.target.value)} 
                    required 
                  />
                </div>
              </>
            ) : (
              <>
                {mode === 'signup' && (
                  <>
                    <div className="field-row">
                      <div className="field">
                        <label>Real Full Name</label>
                        <input 
                          type="text" 
                          placeholder="John Doe" 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          required
                        />
                      </div>
                      <div className="field">
                        <label>In-Game Name (IGN)</label>
                        <input 
                          type="text" 
                          placeholder="FF Nickname" 
                          value={ign} 
                          onChange={e => setIgn(e.target.value)} 
                          required
                        />
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Free Fire UID</label>
                        <input 
                          type="text" 
                          placeholder="123456789" 
                          value={uid} 
                          onChange={e => setUid(e.target.value)} 
                          required
                        />
                      </div>
                      <div className="field">
                        <label>Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="+91 XXXXXXXXXX" 
                          value={phone} 
                          onChange={e => setPhone(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label>Discord / WhatsApp</label>
                      <input 
                        type="text" 
                        placeholder="username#0000 or WhatsApp" 
                        value={discord} 
                        onChange={e => setDiscord(e.target.value)} 
                      />
                    </div>
                  </>
                )}

                <div className={mode === 'signup' ? 'field-row' : ''}>
                  <div className="field">
                    <label>{mode === 'login' ? 'Email or Username' : 'Email Address'}</label>
                    <input 
                      type="text" 
                      placeholder={mode === 'login' ? 'Enter email or username' : 'you@email.com'} 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required
                    />
                  </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--text-dim)', marginTop: '14px' }}>
                  {mode === 'login' ? (
                    <>
                      Don't have an account? <a onClick={() => setMode('signup')} style={{ color: 'var(--orange-2)', cursor: 'pointer', fontWeight: 600 }}>Sign Up</a>
                    </>
                  ) : (
                    <>
                      Already registered? <a onClick={() => setMode('login')} style={{ color: 'var(--orange-2)', cursor: 'pointer', fontWeight: 600 }}>Log In</a>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : mode === 'verify' ? 'Verify Account' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
