import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, BookOpen, Video, PlayCircle,
  ClipboardList, User, Package, Users, Calendar,
  Film, LogOut, Sparkles, X
} from 'lucide-react'

const studentLinks = [
  { to: '/portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/portal/live-classes', icon: Video, label: 'Live Classes' },
  { to: '/portal/recordings', icon: PlayCircle, label: 'Recordings' },
  { to: '/portal/enrollments', icon: ClipboardList, label: 'Enrollments' },
  { to: '/portal/profile', icon: User, label: 'Profile' }
]

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/packages', icon: Package, label: 'Packages' },
  { to: '/admin/enrollments', icon: ClipboardList, label: 'Enrollments' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/live-classes', icon: Calendar, label: 'Live Classes' },
  { to: '/admin/recordings', icon: Film, label: 'Recordings' },
  { to: '/admin/profile', icon: User, label: 'Profile' }
]

export default function Sidebar({ isAdmin = false, isOpen = false, onClose }) {
  const { profile, signOut } = useAuth()
  const links = isAdmin ? adminLinks : studentLinks

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-6)',
          marginBottom: 'var(--space-8)'
        }}
      >
        <div className="sidebar-brand" style={{ padding: 0, margin: 0 }}>
          <div className="brand-icon">
            <Sparkles size={18} />
          </div>
          <span className="gradient-text">Shawkat Tech</span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm hide-desktop"
          aria-label="Close menu"
          style={{ padding: 6 }}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">
          {isAdmin ? 'Admin Panel' : 'Student Portal'}
        </div>

        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/portal/dashboard'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <NavLink
          to={isAdmin ? '/admin/profile' : '/portal/profile'}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', textDecoration: 'none', color: 'inherit' }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              profile?.full_name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <div className="sidebar-user-info" style={{ minWidth: 0, flex: 1 }}>
            <p className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {profile?.full_name || 'User'}
            </p>
            <p className="sidebar-user-role" style={{ margin: 0 }}>{profile?.role}</p>
          </div>
        </NavLink>
        <button
          onClick={signOut}
          className="sidebar-link"
          style={{ color: 'var(--rose)', background: 'transparent', width: '100%' }}
        >
          <LogOut />
          Sign Out
        </button>
      </div>
    </aside>
  )
}