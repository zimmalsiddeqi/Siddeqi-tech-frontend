import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Stay on loading spinner if session is loading OR user exists but profile is still in-flight
  if (loading || (user && profile === null)) {
    return <LoadingSpinner fullScreen />
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role check only runs AFTER profile is guaranteed to be loaded
  if (requireAdmin && profile?.role !== 'admin' && profile?.role !== 'instructor') {
    return <Navigate to="/portal/dashboard" replace />
  }

  return children
}

export function PublicOnlyRoute({ children }) {
  const { user, profile, loading } = useAuth()

  // Prevent premature redirect until both user & profile are known
  if (loading || (user && profile === null)) {
    return <LoadingSpinner fullScreen />
  }

  if (user) {
    if (profile?.role === 'admin' || profile?.role === 'instructor') {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/portal/dashboard" replace />
  }

  return children
}