function Toast({ message, type }) {
  return (
    <div className={`toast ${type === 'error' ? 'toast-error' : ''}`} style={{ opacity: 1, bottom: '24px' }}>
      {type === 'error' ? '❌' : ''} {message}
    </div>
  )
}

export default Toast
