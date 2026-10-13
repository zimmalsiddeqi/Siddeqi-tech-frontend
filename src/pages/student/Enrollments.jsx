import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList, Clock, CheckCircle2, XCircle,
  AlertCircle, Package, BookOpen, Calendar,
  ArrowRight, RefreshCw, MessageCircle
} from 'lucide-react'
import { studentApi } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { toast } from '../../components/Toast'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    badge: 'badge-amber',
    color: 'var(--amber)',
    bgColor: 'var(--amber-light)',
    description: 'Your enrollment is awaiting admin approval. Contact support to speed up the process.'
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    badge: 'badge-mint',
    color: 'var(--mint)',
    bgColor: 'var(--mint-light)',
    description: 'You have full access to this course. Start learning now!'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    badge: 'badge-rose',
    color: 'var(--rose)',
    bgColor: 'var(--rose-light)',
    description: 'This enrollment was declined. Contact support for details.'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    badge: 'badge-rose',
    color: 'var(--rose)',
    bgColor: 'var(--rose-light)',
    description: 'This enrollment has been cancelled.'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    badge: 'badge-sky',
    color: 'var(--sky)',
    bgColor: 'var(--sky-light)',
    description: 'You have completed this course. Congratulations!'
  }
}

const PAYMENT_STATUS_LABELS = {
  not_required: 'Free',
  pending: 'Payment Pending',
  paid: 'Paid',
  failed: 'Payment Failed',
  refunded: 'Refunded'
}

export default function StudentEnrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')

  const fetchEnrollments = useCallback(async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true)
    try {
      const res = await studentApi.getMyEnrollments()
      setEnrollments(res.data || [])
      if (showRefreshToast) toast.success('Enrollments refreshed')
    } catch (err) {
      toast.error(err.message || 'Failed to load enrollments')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  // Filter enrollments
  const filtered = filter === 'all'
    ? enrollments
    : enrollments.filter(e => e.status === filter)

  // Stats
  const stats = {
    all: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    completed: enrollments.filter(e => e.status === 'completed').length
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
            My <span className="gradient-text">Enrollments</span>
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Track all your course and package enrollment requests
          </p>
        </div>
        <button
          className="btn btn-glass btn-sm"
          onClick={() => fetchEnrollments(true)}
          disabled={refreshing}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        className="glass-card"
        style={{
          padding: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          gap: 'var(--space-1)',
          flexWrap: 'wrap'
        }}
      >
        {[
          { value: 'all', label: 'All', count: stats.all },
          { value: 'pending', label: 'Pending', count: stats.pending },
          { value: 'approved', label: 'Approved', count: stats.approved },
          { value: 'completed', label: 'Completed', count: stats.completed }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={filter === tab.value ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            style={{ padding: '0.5rem 1rem' }}
          >
            {tab.label}
            <span
              style={{
                marginLeft: 6,
                padding: '0 6px',
                borderRadius: 'var(--radius-full)',
                background: filter === tab.value ? 'rgba(255,255,255,0.2)' : 'var(--bg-tint)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Enrollments List */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ margin: '0 auto var(--space-4)' }}>
            <ClipboardList size={28} />
          </div>
          <h3>
            {filter === 'all' ? 'No enrollments yet' : `No ${filter} enrollments`}
          </h3>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            {filter === 'all'
              ? 'Browse our catalog and start learning today!'
              : `You don't have any ${filter} enrollments at the moment.`}
          </p>
          {filter === 'all' && (
            <Link to="/courses" className="btn btn-primary">
              Browse Courses <ArrowRight size={16} />
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filtered.map((enrollment) => {
            const config = STATUS_CONFIG[enrollment.status] || STATUS_CONFIG.pending
            const StatusIcon = config.icon
            const isPackage = !!enrollment.package_id
            const name = enrollment.courses?.title
              || enrollment.course_packages?.name
              || 'Unknown'
            const slug = enrollment.courses?.slug
            const bannerUrl = enrollment.courses?.banner_url
            const createdAt = new Date(enrollment.created_at).toLocaleDateString('en-PK', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })

            return (
              <div
                key={enrollment.id}
                className="glass-card"
                style={{
                  padding: 'var(--space-6)',
                  display: 'flex',
                  gap: 'var(--space-5)',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap'
                }}
              >
                {/* Thumbnail / Icon */}
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 'var(--radius-lg)',
                    background: isPackage
                      ? 'var(--gradient-warm)'
                      : 'var(--gradient-cool)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    color: 'white'
                  }}
                >
                  {bannerUrl ? (
                    <img
                      src={bannerUrl}
                      alt={name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : isPackage ? (
                    <Package size={32} />
                  ) : (
                    <BookOpen size={32} />
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-2)',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span className={`badge ${config.badge}`}>
                      <StatusIcon size={10} />
                      {config.label}
                    </span>
                    {isPackage && (
                      <span className="badge badge-lavender">
                        <Package size={10} /> Bundle
                      </span>
                    )}
                    <span className={`badge ${enrollment.payment_status === 'paid' ? 'badge-mint' : 'badge-amber'}`}>
                      {PAYMENT_STATUS_LABELS[enrollment.payment_status] || enrollment.payment_status}
                    </span>
                  </div>

                  <h4 style={{ marginBottom: 'var(--space-2)' }}>{name}</h4>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
                    {config.description}
                  </p>

                  <div style={{ display: 'flex', gap: 'var(--space-5)', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} /> Requested {createdAt}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {enrollment.currency} {new Intl.NumberFormat('en-PK').format(enrollment.amount || 0)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                    alignItems: 'stretch',
                    minWidth: 160
                  }}
                >
                  {enrollment.status === 'approved' && slug && (
                    <Link to={`/courses/${slug}`} className="btn btn-primary btn-sm">
                      Start Learning <ArrowRight size={14} />
                    </Link>
                  )}
                  {enrollment.status === 'pending' && (
                    <a
                      href="https://wa.me/923001234567?text=Hello,%20I%20need%20help%20with%20my%20enrollment"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <MessageCircle size={14} /> Contact Support
                    </a>
                  )}
                  {slug && enrollment.status !== 'approved' && (
                    <Link to={`/courses/${slug}`} className="btn btn-glass btn-sm">
                      View Course
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}