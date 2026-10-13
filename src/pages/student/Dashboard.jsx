import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Video, PlayCircle, Clock, Calendar,
  ArrowRight, TrendingUp, CheckCircle2, AlertCircle,
  Zap, GraduationCap
} from 'lucide-react'
import { studentApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/StatCard'
import LiveBadge from '../../components/LiveBadge'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [liveClasses, setLiveClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [enrollRes, classRes] = await Promise.all([
          studentApi.getMyEnrollments(),
          studentApi.getMyLiveClasses()
        ])
        setEnrollments(enrollRes.data || [])
        setLiveClasses(classRes.data || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Compute stats
  const approvedEnrollments = enrollments.filter(e => e.status === 'approved')
  const pendingEnrollments = enrollments.filter(e => e.status === 'pending')
  const upcomingClasses = liveClasses.filter(c => c.status === 'scheduled')
  const liveNow = liveClasses.filter(c => c.status === 'live')

  // Next upcoming class
  const nextClass = upcomingClasses
    .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start))[0]

  // Format date
  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-PK', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>
          Welcome back, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'Student'}</span>
        </h1>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Here's what's happening with your learning today.
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-5)',
          marginBottom: 'var(--space-8)'
        }}
      >
        <StatCard
          icon={GraduationCap}
          value={approvedEnrollments.length}
          label="Active Courses"
          color="mint"
        />
        <StatCard
          icon={Calendar}
          value={upcomingClasses.length}
          label="Upcoming Classes"
          color="sky"
        />
        <StatCard
          icon={Clock}
          value={pendingEnrollments.length}
          label="Pending Approvals"
          color="peach"
        />
        <StatCard
          icon={Zap}
          value={liveNow.length}
          label="Live Now"
          color="lavender"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-6)'
        }}
      >
        {/* ---- Live Classes Panel ---- */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-5)'
            }}
          >
            <h3 style={{ fontSize: '1.1rem' }}>
              <Video size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--mint)' }} />
              Live Classes
            </h3>
            <Link to="/portal/live-classes" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {liveNow.length > 0 && (
            <div
              style={{
                padding: 'var(--space-4)',
                background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <LiveBadge />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  Class in progress!
                </span>
              </div>
              {liveNow.map((cls) => (
                <Link
                  key={cls.id}
                  to={`/portal/live/${cls.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 4 }}
                >
                  Join Now: {cls.title}
                </Link>
              ))}
            </div>
          )}

          {nextClass ? (
            <div
              className="glass-card"
              style={{
                padding: 'var(--space-4)',
                background: 'var(--glass-bg-subtle)'
              }}
            >
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Next Up
              </p>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 4 }}>
                {nextClass.title}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} />
                {formatDate(nextClass.scheduled_start)}
              </p>
              {nextClass.courses && (
                <span className="badge badge-sky" style={{ marginTop: 8 }}>
                  {nextClass.courses.title}
                </span>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-muted)' }}>
              <Calendar size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: '0.9rem' }}>No upcoming classes</p>
            </div>
          )}
        </div>

        {/* ---- Enrollments Panel ---- */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-5)'
            }}
          >
            <h3 style={{ fontSize: '1.1rem' }}>
              <BookOpen size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--peach)' }} />
              My Enrollments
            </h3>
            <Link to="/portal/enrollments" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {enrollments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {enrollments.slice(0, 4).map((enrollment) => {
                const courseName = enrollment.courses?.title
                  || enrollment.course_packages?.name
                  || 'Unknown'

                const statusColors = {
                  pending: 'badge-amber',
                  approved: 'badge-mint',
                  rejected: 'badge-rose',
                  cancelled: 'badge-rose',
                  completed: 'badge-sky'
                }

                return (
                  <div
                    key={enrollment.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3) var(--space-4)',
                      background: 'var(--glass-bg-subtle)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {courseName}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {enrollment.currency} {new Intl.NumberFormat('en-PK').format(enrollment.amount)}
                      </p>
                    </div>
                    <span className={`badge ${statusColors[enrollment.status] || 'badge-amber'}`}>
                      {enrollment.status}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-muted)' }}>
              <BookOpen size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: '0.9rem', marginBottom: 12 }}>No enrollments yet</p>
              <Link to="/courses" className="btn btn-primary btn-sm">
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-6)'
        }}
      >
        {[
          { to: '/courses', icon: BookOpen, label: 'Browse Courses', color: 'var(--gradient-mint)' },
          { to: '/portal/recordings', icon: PlayCircle, label: 'Watch Recordings', color: 'var(--gradient-cool)' },
          { to: '/portal/live-classes', icon: Video, label: 'Live Classes', color: 'var(--gradient-warm)' },
          { to: '/portal/profile', icon: TrendingUp, label: 'My Profile', color: 'linear-gradient(135deg, var(--lavender), var(--lavender-soft))' }
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="glass-card"
            style={{
              padding: 'var(--space-5)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              textDecoration: 'none',
              color: 'var(--text-primary)'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: action.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
              }}
            >
              <action.icon size={18} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .glass-card + .glass-card { margin-top: 0; }
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}