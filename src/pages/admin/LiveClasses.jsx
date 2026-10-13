import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Calendar, Clock, Video, Play, Square,
  XCircle, Loader2, Film, StopCircle, Radio,
  Edit3, Save, AlertCircle
} from 'lucide-react'
import { adminApi } from '../../services/api'
import Modal from '../../components/Modal'
import LoadingSpinner from '../../components/LoadingSpinner'
import LiveBadge from '../../components/LiveBadge'
import { toast } from '../../components/Toast'

const STATUS_CONFIG = {
  scheduled: { badge: 'badge-sky', color: 'var(--sky)', icon: Calendar },
  live: { badge: 'badge-rose', color: 'var(--rose)', icon: Radio },
  completed: { badge: 'badge-mint', color: 'var(--mint)', icon: Square },
  cancelled: { badge: 'badge-amber', color: 'var(--amber)', icon: XCircle }
}

export default function AdminLiveClasses() {
  const [classes, setClasses] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    scheduled_start: '',
    scheduled_end: '',
    timezone: 'Asia/Karachi',
    recording_enabled: true,
    chat_enabled: true
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [classRes, courseRes] = await Promise.all([
        adminApi.getLiveClasses({ page, per_page: 15, status: statusFilter || undefined }),
        adminApi.getCourses({ per_page: 100, status: 'published' })
      ])
      setClasses(classRes.data || [])
      setPagination(classRes.meta || null)
      setCourses(courseRes.data || [])
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  function openCreate() {
    setEditingId(null)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    const end = new Date(tomorrow)
    end.setHours(12, 0, 0, 0)

    setFormData({
      course_id: courses[0]?.id || '',
      title: '',
      description: '',
      scheduled_start: toLocalDatetime(tomorrow),
      scheduled_end: toLocalDatetime(end),
      timezone: 'Asia/Karachi',
      recording_enabled: true,
      chat_enabled: true
    })
    setModalOpen(true)
  }

  function openEdit(cls) {
    setEditingId(cls.id)
    setFormData({
      course_id: cls.course_id,
      title: cls.title,
      description: cls.description || '',
      scheduled_start: toLocalDatetime(new Date(cls.scheduled_start)),
      scheduled_end: toLocalDatetime(new Date(cls.scheduled_end)),
      timezone: cls.timezone || 'Asia/Karachi',
      recording_enabled: cls.recording_enabled,
      chat_enabled: cls.chat_enabled
    })
    setModalOpen(true)
  }

  function toLocalDatetime(date) {
    const offset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  }

  async function handleSave() {
    if (!formData.course_id || !formData.title.trim() || !formData.scheduled_start || !formData.scheduled_end) {
      toast.error('Fill in all required fields')
      return
    }

    if (new Date(formData.scheduled_end) <= new Date(formData.scheduled_start)) {
      toast.error('End time must be after start time')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...formData,
        scheduled_start: new Date(formData.scheduled_start).toISOString(),
        scheduled_end: new Date(formData.scheduled_end).toISOString()
      }

      if (editingId) {
        await adminApi.updateLiveClass(editingId, payload)
        toast.success('Class updated')
      } else {
        await adminApi.createLiveClass(payload)
        toast.success('Class scheduled')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleAction(classId, action) {
    setActionLoading(classId)
    try {
      if (action === 'start') {
        const res = await adminApi.startLiveClass(classId)
        toast.success('Class is now LIVE! Room created.')
        if (res.data?.token) {
          toast.success('Instructor token generated.')
        }
      } else if (action === 'end') {
        await adminApi.endLiveClass(classId)
        toast.success('Class ended. Room closed.')
      } else if (action === 'cancel') {
        if (!confirm('Cancel this class?')) { setActionLoading(null); return }
        await adminApi.cancelLiveClass(classId)
        toast.success('Class cancelled')
      } else if (action === 'record-start') {
        await adminApi.startRecording(classId)
        toast.success('Recording started! Make sure you are in the classroom with mic/camera/screen on.')
      } else if (action === 'record-stop') {
        await adminApi.stopRecording(classId)
        toast.success('Recording stopped. Processing...')
      }
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  function formatFullDate(dateStr) {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleDateString('en-PK', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  function formatTime(dateStr) {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleTimeString('en-PK', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading && classes.length === 0) return <LoadingSpinner />

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>
            Live Class <span className="gradient-text">Studio</span>
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>Schedule, launch, and manage live sessions</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Schedule Class
        </button>
      </div>

      {/* Filter */}
      <div className="glass-card" style={{ padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {['', 'scheduled', 'live', 'completed', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={statusFilter === s ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div
        className="glass-card"
        style={{
          padding: 'var(--space-4) var(--space-5)',
          marginBottom: 'var(--space-6)',
          background: 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(167,139,250,0.04))',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)'
        }}
      >
        <AlertCircle size={18} style={{ color: 'var(--sky)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Recording Tip:</strong> After launching a class, click <strong>"Enter Classroom"</strong> and turn on your mic, camera, or screen share <em>before</em> clicking "Start Recording". LiveKit cannot record an empty room.
        </div>
      </div>

      {/* Classes List */}
      {classes.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <Calendar size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <h3>No classes found</h3>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 8 }}>Schedule your first live class.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {classes.map((cls) => {
            const config = STATUS_CONFIG[cls.status] || STATUS_CONFIG.scheduled
            const StatusIcon = config.icon
            const isLive = cls.status === 'live'
            const isScheduled = cls.status === 'scheduled'
            const isActionLoading = actionLoading === cls.id

            return (
              <div
                key={cls.id}
                className="glass-card"
                style={{
                  padding: 'var(--space-6)',
                  borderLeft: `4px solid ${config.color}`,
                  background: isLive
                    ? 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(239,68,68,0.02))'
                    : undefined
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                      {isLive && <LiveBadge />}
                      <span className={`badge ${config.badge}`}>
                        <StatusIcon size={10} /> {cls.status}
                      </span>
                      {cls.courses?.title && (
                        <span className="badge badge-lavender">{cls.courses.title}</span>
                      )}
                    </div>
                    <h4 style={{ marginBottom: 'var(--space-1)' }}>{cls.title}</h4>
                    {cls.description && (
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)' }}>{cls.description}</p>
                    )}
                  </div>

                  {isScheduled && (
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cls)}>
                      <Edit3 size={14} /> Edit
                    </button>
                  )}
                </div>

                {/* Schedule Info */}
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--space-6)',
                    marginBottom: 'var(--space-4)',
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} style={{ color: 'var(--sky)' }} />
                    {formatFullDate(cls.scheduled_start)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} style={{ color: 'var(--peach)' }} />
                    {formatTime(cls.scheduled_start)} — {formatTime(cls.scheduled_end)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {cls.timezone}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>

                  {/* ---- SCHEDULED: Launch or Cancel ---- */}
                  {isScheduled && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAction(cls.id, 'start')}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
                        Launch Live
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleAction(cls.id, 'cancel')}
                        disabled={isActionLoading}
                        style={{ color: 'var(--amber)' }}
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    </>
                  )}

                  {/* ---- LIVE: Enter Classroom + Recording + End ---- */}
                  {isLive && (
                    <>
                      {/* ENTER CLASSROOM — Opens LiveKit room in new tab */}
                      <a
                        href={`/admin/live/${cls.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        <Video size={14} /> Enter Classroom
                      </a>

                      {cls.recording_enabled && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAction(cls.id, 'record-start')}
                            disabled={isActionLoading}
                          >
                            {isActionLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Film size={14} />}
                            Start Recording
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleAction(cls.id, 'record-stop')}
                            disabled={isActionLoading}
                            style={{ color: 'var(--rose)' }}
                          >
                            <StopCircle size={14} /> Stop Recording
                          </button>
                        </>
                      )}

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleAction(cls.id, 'end')}
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Square size={14} />}
                        End Class
                      </button>
                    </>
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

      {/* Schedule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Class' : 'Schedule New Class'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={14} /> {editingId ? 'Update' : 'Schedule'}</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="input-group">
            <label>Course *</label>
            <select className="input" value={formData.course_id} onChange={e => setFormData(p => ({ ...p, course_id: e.target.value }))}>
              <option value="">Select a course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Class Title *</label>
            <input className="input" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Week 1: Introduction to AI Agents" />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea className="input" rows={2} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="What will be covered in this session?" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label>Start Time *</label>
              <input className="input" type="datetime-local" value={formData.scheduled_start} onChange={e => setFormData(p => ({ ...p, scheduled_start: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>End Time *</label>
              <input className="input" type="datetime-local" value={formData.scheduled_end} onChange={e => setFormData(p => ({ ...p, scheduled_end: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={formData.recording_enabled} onChange={e => setFormData(p => ({ ...p, recording_enabled: e.target.checked }))} style={{ accentColor: 'var(--mint)' }} />
              Enable Recording
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={formData.chat_enabled} onChange={e => setFormData(p => ({ ...p, chat_enabled: e.target.checked }))} style={{ accentColor: 'var(--mint)' }} />
              Enable Chat
            </label>
          </div>
        </div>
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}