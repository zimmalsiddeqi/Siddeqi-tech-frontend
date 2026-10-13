import { useState, useEffect, useCallback } from 'react'
import {
  Users, Search, MessageCircle, Mail, Phone,
  Shield, ShieldOff, Eye, Loader2, RefreshCw,
  Calendar, BookOpen, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react'
import { adminApi } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { toast } from '../../components/Toast'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState(null)
  const [studentDetail, setStudentDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getStudents({
        page,
        per_page: 15,
        search: search || undefined
      })
      setStudents(res.data || [])
      setPagination(res.meta || null)
    } catch (err) {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    fetchStudents()
  }, [page, debouncedSearch])

  async function toggleStudentStatus(student) {
    const newStatus = !student.is_active
    const action = newStatus ? 'activate' : 'deactivate'
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${student.full_name}?`)) return

    setTogglingId(student.id)
    try {
      await adminApi.updateStudentStatus(student.id, { is_active: newStatus })
      toast.success(`Student ${action}d`)
      fetchStudents()
    } catch (err) {
      toast.error(err.message || 'Action failed')
    } finally {
      setTogglingId(null)
    }
  }

  async function toggleExpand(studentId) {
    if (expandedId === studentId) {
      setExpandedId(null)
      setStudentDetail(null)
      return
    }

    setExpandedId(studentId)
    setDetailLoading(true)
    try {
      const res = await adminApi.getStudent(studentId)
      setStudentDetail(res.data)
    } catch (err) {
      toast.error('Failed to load student details')
      setExpandedId(null)
    } finally {
      setDetailLoading(false)
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
    return new Date(dateStr).toLocaleDateString('en-PK', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  if (loading && students.length === 0) return <LoadingSpinner />

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>
            Student <span className="gradient-text">Management</span>
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>
            View, search, and manage all registered students
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <div className="glass-card" style={{ padding: 'var(--space-3) var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Users size={16} style={{ color: 'var(--mint)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
              {pagination?.total || 0}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="input"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, border: 'none', background: 'transparent', boxShadow: 'none', padding: '0.4rem 0' }}
        />
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <Users size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <h3>No students found</h3>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 8 }}>
            Students will appear here after registration.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {students.map((student) => {
            const isExpanded = expandedId === student.id
            const waLink = whatsappLink(student.whatsapp)

            return (
              <div key={student.id}>
                {/* Main Row */}
                <div
                  className="glass-card"
                  style={{
                    padding: 'var(--space-4) var(--space-5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    flexWrap: 'wrap',
                    borderLeft: `4px solid ${student.is_active ? 'var(--mint)' : 'var(--rose)'}`
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-full)',
                      background: student.is_active ? 'var(--gradient-primary)' : 'var(--gradient-warm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}
                  >
                    {student.avatar_url ? (
                      <img src={student.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (student.full_name || 'S').charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {student.full_name || 'Unnamed'}
                      </span>
                      {student.is_active ? (
                        <span className="badge badge-mint">Active</span>
                      ) : (
                        <span className="badge badge-rose">Inactive</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, flexWrap: 'wrap' }}>
                      {student.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Mail size={11} /> {student.email}
                        </span>
                      )}
                      {student.whatsapp && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Phone size={11} /> {student.whatsapp}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Calendar size={11} /> {formatDate(student.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleExpand(student.id)}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Details
                    </button>
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <MessageCircle size={14} /> Chat
                      </a>
                    )}
                    <button
                      className={`btn btn-sm ${student.is_active ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => toggleStudentStatus(student)}
                      disabled={togglingId === student.id}
                    >
                      {togglingId === student.id ? (
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : student.is_active ? (
                        <><ShieldOff size={14} /> Deactivate</>
                      ) : (
                        <><Shield size={14} /> Activate</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div
                    className="glass-card"
                    style={{
                      marginTop: 'var(--space-2)',
                      padding: 'var(--space-6)',
                      background: 'var(--glass-bg-subtle)',
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  >
                    {detailLoading ? (
                      <LoadingSpinner />
                    ) : studentDetail ? (
                      <div>
                        <h4 style={{ marginBottom: 'var(--space-4)' }}>
                          <BookOpen size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--sky)' }} />
                          Enrollments ({studentDetail.enrollments?.length || 0})
                        </h4>

                        {studentDetail.enrollments?.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 'var(--space-6)' }}>
                            No enrollments yet.
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                            {studentDetail.enrollments?.map((e) => {
                              const name = e.courses?.title || e.course_packages?.name || 'Unknown'
                              const statusBadge = {
                                pending: 'badge-amber', approved: 'badge-mint',
                                rejected: 'badge-rose', cancelled: 'badge-rose', completed: 'badge-sky'
                              }
                              return (
                                <div
                                  key={e.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 'var(--space-3)',
                                    background: 'var(--glass-bg)',
                                    borderRadius: 'var(--radius-md)',
                                    flexWrap: 'wrap',
                                    gap: 'var(--space-2)'
                                  }}
                                >
                                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                                    {name}
                                  </span>
                                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                    <span className={`badge ${statusBadge[e.status]}`}>{e.status}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                      {e.currency} {new Intl.NumberFormat('en-PK').format(e.amount || 0)}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        <h4 style={{ marginBottom: 'var(--space-4)' }}>
                          <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--mint)' }} />
                          Active Course Access ({studentDetail.course_access?.filter(a => a.is_active).length || 0})
                        </h4>

                        {studentDetail.course_access?.filter(a => a.is_active).length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            No active course access. Approve an enrollment to grant access.
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                            {studentDetail.course_access
                              ?.filter(a => a.is_active)
                              .map((access) => (
                                <span key={access.id} className="badge badge-mint" style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem' }}>
                                  {access.courses?.title || 'Unknown Course'}
                                  <span style={{ marginLeft: 6, opacity: 0.6, fontFamily: 'var(--font-mono)' }}>
                                    ({access.granted_by})
                                  </span>
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>Failed to load details.</p>
                    )}
                  </div>
                )}
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