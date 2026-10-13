import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2, XCircle, Search, RefreshCw,
  MessageCircle, Filter, Loader2, ClipboardList,
  Phone, Mail, User
} from 'lucide-react'
import { adminApi } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { toast } from '../../components/Toast'

const STATUS_CONFIG = {
  pending: { badge: 'badge-amber', color: 'var(--amber)' },
  approved: { badge: 'badge-mint', color: 'var(--mint)' },
  rejected: { badge: 'badge-rose', color: 'var(--rose)' },
  cancelled: { badge: 'badge-rose', color: 'var(--rose)' },
  completed: { badge: 'badge-sky', color: 'var(--sky)' }
}

const PAYMENT_LABELS = {
  not_required: 'Free',
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded'
}

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState(null)

  const fetchEnrollments = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await adminApi.getEnrollments({
        page,
        per_page: 15,
        status: statusFilter || undefined,
        search: search || undefined
      })
      setEnrollments(res.data || [])
      setPagination(res.meta || null)
      if (showToast) toast.success('Refreshed')
    } catch (err) {
      toast.error('Failed to load enrollments')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, statusFilter, search])

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    fetchEnrollments()
  }, [page, statusFilter, debouncedSearch])

  async function handleApprove(id) {
    setProcessingId(id)
    try {
      await adminApi.updateEnrollment(id, { status: 'approved', payment_status: 'paid' })
      toast.success('Enrollment approved! Course access granted.')
      fetchEnrollments()
    } catch (err) {
      toast.error(err.message || 'Approval failed')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(id) {
    if (!confirm('Reject this enrollment? The student will lose access.')) return
    setProcessingId(id)
    try {
      await adminApi.updateEnrollment(id, { status: 'rejected' })
      toast.success('Enrollment rejected')
      fetchEnrollments()
    } catch (err) {
      toast.error(err.message || 'Rejection failed')
    } finally {
      setProcessingId(null)
    }
  }

  function whatsappLink(phone) {
    if (!phone) return null
    let cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = '92' + cleaned.slice(1)
    if (!cleaned.startsWith('92') && cleaned.length === 10) cleaned = '92' + cleaned
    return `https://wa.me/${cleaned}`
  }

  function formatDate(dateStr) {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading && enrollments.length === 0) return <LoadingSpinner />

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>
            Enrollment <span className="gradient-text">Approvals</span>
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>Review and manage student enrollment requests</p>
        </div>
        <button className="btn btn-glass btn-sm" onClick={() => fetchEnrollments(true)} disabled={refreshing}>
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="input"
          placeholder="Search by student name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, border: 'none', background: 'transparent', boxShadow: 'none', padding: '0.4rem 0' }}
        />
        <select
          className="input"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ width: 'auto', minWidth: 150 }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', count: pagination?.total || 0, color: 'var(--text-primary)' },
          { label: 'Pending', count: enrollments.filter(e => e.status === 'pending').length, color: 'var(--amber)' },
          { label: 'Approved', count: enrollments.filter(e => e.status === 'approved').length, color: 'var(--mint)' }
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: 'var(--space-3) var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Enrollment List */}
      {enrollments.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <ClipboardList size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <h3>No enrollments found</h3>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 8 }}>
            {statusFilter === 'pending' ? 'All caught up! No pending requests.' : 'Enrollments will appear when students register.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {enrollments.map((enrollment) => {
            const student = enrollment.profiles || {}
            const courseName = enrollment.courses?.title || enrollment.course_packages?.name || 'Unknown'
            const config = STATUS_CONFIG[enrollment.status] || STATUS_CONFIG.pending
            const isPending = enrollment.status === 'pending'
            const isProcessing = processingId === enrollment.id
            const waLink = whatsappLink(student.whatsapp)

            return (
              <div
                key={enrollment.id}
                className="glass-card"
                style={{
                  padding: 'var(--space-5) var(--space-6)',
                  borderLeft: `4px solid ${config.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-5)',
                  flexWrap: 'wrap'
                }}
              >
                {/* Student Avatar */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    flexShrink: 0
                  }}
                >
                  {(student.full_name || 'S').charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {student.full_name || 'Unknown Student'}
                    </span>
                    <span className={`badge ${config.badge}`}>{enrollment.status}</span>
                    <span className={`badge ${enrollment.payment_status === 'paid' ? 'badge-mint' : 'badge-amber'}`}>
                      {PAYMENT_LABELS[enrollment.payment_status]}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    {courseName}
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    {student.email && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={12} /> {student.email}
                      </span>
                    )}
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {enrollment.currency} {new Intl.NumberFormat('en-PK').format(enrollment.amount || 0)}
                    </span>
                    <span>{formatDate(enrollment.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {isPending && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApprove(enrollment.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />}
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReject(enrollment.id)}
                        disabled={isProcessing}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
          <button className="btn btn-glass btn-sm" disabled={!pagination.has_prev} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 var(--space-3)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            {pagination.page}/{pagination.total_pages}
          </span>
          <button className="btn btn-glass btn-sm" disabled={!pagination.has_next} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}