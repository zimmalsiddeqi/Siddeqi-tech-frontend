export default function LoadingSpinner({ fullScreen = false, size = 40 }) {
  const spinner = (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid var(--mint-light)`,
        borderTopColor: 'var(--mint)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }}
    />
  )

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          zIndex: 9999
        }}
      >
        {spinner}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      {spinner}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}