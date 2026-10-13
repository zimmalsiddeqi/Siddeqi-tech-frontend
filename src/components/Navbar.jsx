import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Home, BookOpen, Package, Menu, X, LogOut,
  LayoutDashboard, Sparkles, ArrowRight, User, Shield
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/packages', label: 'Packages', icon: Package }
]

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Track window scroll for luxury backdrop enhancement
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const userInitial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'
  const firstName = profile?.full_name?.split(' ')[0] || (isAdmin ? 'Admin' : 'Student')
  const dashboardLink = isAdmin ? '/admin' : '/portal/dashboard'

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Sparkles size={18} />
          </div>
          <span>Shawkat</span>
          <span className="brand-accent">Tech</span>
        </Link>

        {/* Floating Center Pill Capsule (Desktop) */}
        <nav className="hide-mobile">
          <ul className="navbar-pill-nav">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) => `navbar-pill-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              {/* Personalized Account Chip */}
              <Link to={dashboardLink} className="navbar-user-chip hide-mobile" title="Go to Dashboard">
                <div className="navbar-avatar">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" />
                  ) : (
                    userInitial
                  )}
                </div>
                <span>{firstName}</span>
                <span className="navbar-role-tag">
                  {isAdmin ? 'Admin' : 'Portal'}
                </span>
              </Link>

              {/* Direct Dashboard Button */}
              <Link
                to={dashboardLink}
                className="btn btn-glass btn-sm hide-mobile"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={signOut}
                className="btn btn-ghost btn-sm"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
                <span className="hide-mobile">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm btn-nav-cta">
                <span>Get Started</span>
                <ArrowRight size={15} />
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="btn btn-ghost hide-desktop"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            style={{ padding: 8 }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer & Backdrop */}
      {mobileOpen && (
        <>
          <div
            className="navbar-mobile-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="navbar-mobile-drawer">
            {/* User status banner if logged in */}
            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                <div className="navbar-avatar" style={{ width: 34, height: 34, fontSize: '0.85rem' }}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" />
                  ) : (
                    userInitial
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {profile?.full_name || user.email}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {profile?.role || 'Student'} Account
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `navbar-mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}

            {user ? (
              <>
                <NavLink
                  to={dashboardLink}
                  className="navbar-mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  <span>{isAdmin ? 'Admin Panel' : 'Student Dashboard'}</span>
                </NavLink>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    signOut()
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--rose)', marginTop: 'var(--space-2)' }}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  )
}