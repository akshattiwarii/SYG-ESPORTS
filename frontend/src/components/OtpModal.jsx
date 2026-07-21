import { useState } from 'react'

function OtpModal({ regId, otp, title, onClose, showToast, refreshData }) {
  const [inputOtp, setInputOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputOtp) return showToast('⚠ Please enter the OTP code', 'error')

    setLoading(true)
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regId, otp: inputOtp })
      })
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.error || 'Invalid OTP')

      showToast('Registration successfully verified! ✓')
      onClose()
      await refreshData()
    } catch (err) {
      showToast(`⚠ ${err.message || 'OTP verification failed'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Verify OTP</h3>
          <div className="modal-close" style={{ cursor: 'pointer' }} onClick={onClose}>✕</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ marginBottom: '14px', fontSize: '13.5px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Enter the OTP sent to your Captain's details to confirm slot in <b>{title}</b>.
            </p>
            <div className="field">
              <label>Verification OTP Code</label>
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                value={inputOtp} 
                onChange={e => setInputOtp(e.target.value)} 
                required
              />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OtpModal
