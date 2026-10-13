import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Video, Calendar, Clock, Play, Users,
  AlertCircle, RefreshCw, CalendarCheck, ArrowRight
} from 'lucide-react'
import { studentApi } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import LiveBadge from '../../components/LiveBadge'
import { toast } from '../../components/Toast'

export default function StudentLiveClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchClasses = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true)
    try {
      const res = await studentApi.getMyLiveClasses()
      setClasses(res.data || [])
      if (showToast) toast.success('Classes refreshed')
    } catch (err) {
      toast.error(err.message || 'Failed to load classes')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchClasses()
    // Auto-refresh every 60 seconds to catch newly live classes
    const interval = setInterval(() => fetchClasses(false), 60000)
    return () => clearInterval(interval)
  }, [fetchClasses])

  // Separate live vs. scheduled
  const liveNow = classes.filter(c => c.status === 'live')
  const upcoming = classes
    .filter(c => c.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start))

  function formatFullDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-PK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getRelativeTime(dateStr) {
    const target = new Date(dateStr)
    const now = new Date()
    const diffMs = target - now
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffMs < 0) return 'Started'
    if (diffHours < 1) return `In ${Math.ceil(diffMs / (1000 * 60))} min`
    if (diffHours < 24) return `In ${diffHours}h`
    if (diffDays < 7) return `In ${diffDays}d`
    return formatFullDate(dateStr)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-8)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>
            Live <span className="gradient-text">Classes</span>
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Join live sessions and never miss a class
          </p>
        </div>
        <button
          className="btn btn-glass btn-sm"
          onClick={() => fetchClasses(true)}
          disabled={refreshing}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ---- LIVE NOW SECTION ---- */}
      {liveNow.length > 0 && (
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)'
            }}
          >
            <h3 style={{ fontSize: '1.15rem' }}>Live Now</h3>
            <LiveBadge />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {liveNow.map((cls) => (
              <div
                key={cls.id}
                className="glass-card-strong"
                style={{
                  padding: 'var(--space-6)',
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))',
                  border: '1px solid rgba(239,68,68,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-5)',
                  flexWrap: 'wrap'
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, #EF4444, #F87171)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse-soft 1.5s ease-in-out infinite',
                    boxShadow: '0 0 24px rgba(239,68,68,0.4)',
                    flexShrink: 0
                  }}
                >
                  <Video size={26} color="white" />
                </div>

                <div style={{ flex: 1, minWidth: 240 }}>
                  <h4 style={{ marginBottom: 'var(--space-2)' }}>{cls.title}</h4>
                  {cls.courses?.title && (
                    <span className="badge badge-sky" style={{ marginBottom: 8 }}>
                      {cls.courses.title}
                    </span>
                  )}
                  {cls.description && (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                      {cls.description}
                    </p>
                  )}
                </div>

                <Link
                  to={`/portal/live/${cls.id}`}
                  className="btn btn-primary btn-lg"
                >
                  <Play size={18} />
                  Join Class
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- UPCOMING SECTION ---- */}
      <div>
        <h3 style={{ fontSize: '1.15rem', marginBottom: 'var(--space-4)' }}>
          <CalendarCheck size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--sky)' }} />
          Upcoming Classes
        </h3>

        {upcoming.length === 0 && liveNow.length === 0 ? (
          <div className="glass-card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ margin: '0 auto var(--space-4)' }}>
              <Calendar size={28} />
            </div>
            <h3>No classes scheduled</h3>
            <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
              Classes are scheduled by your instructor. You'll see them here when available.
            </p>
            <Link to="/portal/enrollments" className="btn btn-glass">
              View My Enrollments <ArrowRight size={16} />
            </Link>
          </div>
        ) : upcoming.length === 0 ? (
          <div className="glass-card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-tertiary)' }}>No upcoming classes scheduled.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 'var(--space-5)'
            }}
          >
            {upcoming.map((cls) => {
              const relative = getRelativeTime(cls.scheduled_start)
              const isSoon = relative.includes('min') || (relative.includes('h') && parseInt(relative.match(/\d+/)?.[0]) < 2)

              return (
                <div key={cls.id} className="glass-card" style={{ padding: 'var(--space-6)' }}>
                  {/* Course badge */}
                  {cls.courses?.title && (
                    <span className="badge badge-sky" style={{ marginBottom: 'var(--space-3)' }}>
                      {cls.courses.title}
                    </span>
                  )}

                  {/* Title */}
                  <h4 style={{ marginBottom: 'var(--space-2)' }}>{cls.title}</h4>

                  {/* Description */}
                  {cls.description && (
                    <p
                      style={{
                        fontSize: '0.88rem',
                        color: 'var(--text-tertiary)',
                        marginBottom: 'var(--space-4)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {cls.description}
                    </p>
                  )}

                  {/* Date & Time */}
                  <div
                    style={{
                      padding: 'var(--space-4)',
                      background: 'var(--glass-bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--space-4)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Calendar size={14} style={{ color: 'var(--mint)' }} />
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {formatFullDate(cls.scheduled_start)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={14} style={{ color: 'var(--peach)' }} />
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                        {formatTime(cls.scheduled_start)} - {formatTime(cls.scheduled_end)}
                      </span>
                    </div>
                  </div>

                  {/* Relative Time */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 'var(--space-2)'
                    }}
                  >
                    <span
                      className={isSoon ? 'badge badge-rose' : 'badge badge-lavender'}
                      style={{ fontSize: '0.72rem' }}
                    >
                      <Clock size={10} /> {relative}
                    </span>
                    {isSoon && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                        Join button will appear when class starts
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      {classes.length === 0 && (
        <div
          className="glass-card"
          style={{
            padding: 'var(--space-5)',
            marginTop: 'var(--space-6)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            background: 'linear-gradient(135deg, rgba(14,165,233,0.05), rgba(14,165,233,0.02))'
          }}
        >
          <AlertCircle size={20} style={{ color: 'var(--sky)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Why don't I see any classes?
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)' }}>
              Live classes only appear here for courses you've enrolled in and been approved for.{' '}
              <Link to="/portal/enrollments" style={{ color: 'var(--sky)', fontWeight: 600 }}>
                Check your enrollments
              </Link>
              {' '}or{' '}
              <Link to="/courses" style={{ color: 'var(--sky)', fontWeight: 600 }}>
                browse courses
              </Link>.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}