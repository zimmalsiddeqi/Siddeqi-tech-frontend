// ============================================
// Auth Context — Supabase session management
// ============================================

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from backend after auth
  async function fetchProfile(session) {
    if (!session?.access_token) {
      setUser(null)
      setProfile(null)
      return null
    }

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
      const res = await fetch(`${API_BASE}/api/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      const data = await res.json()

      if (data.success && data.data) {
        setUser(session.user)
        setProfile(data.data)
        return data.data
      } else {
        setUser(session.user)
        setProfile(null)
        return null
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setUser(session.user)
      setProfile(null)
      return null
    }
  }

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session && mounted) {
          await fetchProfile(session)
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            await fetchProfile(session)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Auth methods
  async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    if (error) throw error
    return data
  }

  async function signIn(email, password) {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error

      const userProfile = await fetchProfile(data.session)
      return { ...data, profile: userProfile }
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function refreshProfile() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      return await fetchProfile(session)
    }
    return null
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    isAdmin: profile?.role === 'admin' || profile?.role === 'instructor',
    isStudent: profile?.role === 'student'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}