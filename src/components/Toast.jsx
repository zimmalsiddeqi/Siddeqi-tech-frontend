import { Toaster, toast } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          color: 'var(--text-primary)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          fontWeight: 500,
          boxShadow: 'var(--shadow-lg)',
          padding: '0.9rem 1.1rem'
        },
        success: {
          iconTheme: { primary: '#10B981', secondary: '#FFFFFF' }
        },
        error: {
          iconTheme: { primary: '#F43F5E', secondary: '#FFFFFF' }
        }
      }}
    />
  )
}

export { toast }