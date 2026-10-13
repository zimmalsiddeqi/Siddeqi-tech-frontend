import { useState, useEffect, useCallback } from 'react'
import {
  Film, Play, Eye, EyeOff, Clock, Download,
  Loader2, Search, Filter, CheckCircle2, AlertCircle,
  ArrowUp, ArrowDown, Save, Trash2
} from 'lucide-react'
import { adminApi } from '../../services/api'
import Modal from '../../components/Modal'
import LoadingSpinner from '../../components/LoadingSpinner'
import { toast } from '../../components/Toast'

const PROCESSING_CONFIG = {
  not_started: { badge: 'badge-amber', label: 'Not Started' },
  starting: { badge: 'badge-amber', label: 'Starting...' },
  recording: { badge: 'badge-rose', label: 'Recording' },
  processing: { badge: 'badge-sky', label: 'Processing' },
  ready: { badge: 'badge-mint', label: 'Ready' },
  failed: { badge: 'badge-rose', label: 'Failed' }
}

const PUBLICATION_CONFIG = {
  draft: { badge: 'badge-amber', label: 'Draft' },
  published: { badge: 'badge-mint', label: 'Published' },
  archived: { badge: 'badge-rose', label: 'Archived' }
}

export default function AdminRecordings() {
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [courseFilter, setCourseFilter] = useState('')
  const [processingFilter, setProcessingFilter] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  // Publish modal
  const [publishModal, setPublishModal] = useState(null) // recording object
  const [publishData, setPublishData] = useState({ title: '', description: '', lesson_order: 0, allow_download: false })
  const [publishing, setPublishing] = useState(false)

  const fetchRecordings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getRecordings({
        page,
        per_page: 15,
        course_id: courseFilter || undefined,
        processing_status: processingFilter || undefined
      })
      setRecordings(res.data || [])
      setPagination(res.meta || null)
    } catch (err) {
      toast.error('Failed to load recordings')
    } finally {
      setLoading(false)
    }
  }, [page, courseFilter, processingFilter])

  useEffect(() => { fetchRecordings() }, [fetchRecordings])

  // Get unique courses from recordings for filter
  const courseOptions = [...new Map(
    recordings
      .filter(r => r.courses?.id)
      .map(r => [r.courses.id, r.courses.title])
  ).entries()].map(([id, title]) => ({ id, title }))

  async function handlePublish() {
    if (!publishModal) return
    setPublishing(true)
    try {
      await adminApi.publishRecording(publishModal.id, publishData)
      toast.success('Recording published! Students can now watch it.')
      setPublishModal(null)
      fetchRecordings()
    } catch (err) {
      toast.error(err.message || 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  async function handleUnpublish(id) {
    if (!confirm('Unpublish this recording? Students will lose access.')) return
    setActionLoading(id)
    try {
      await adminApi.unpublishRecording(id)
      toast.success('Recording unpublished')
      fetchRecordings()
    } catch (err) {
      toast.error(err.message || 'Unpublish failed')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this recording? This action cannot be undone.')) return
    setActionLoading(id)
    try {
      await adminApi.deleteRecording(id)
      toast.success('Recording deleted')
      fetchRecordings()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    } finally {
      setActionLoading(null)
    }
  }

  function openPublishModal(recording) {
    setPublishModal(recording)
    setPublishData({
      title: recording.title || '',
      description: recording.description || '',
      lesson_order: recording.lesson_order || 0,
      allow_download: recording.allow_download || false
    })
  }

  function formatDuration(seconds) {
    if (!seconds) return '--'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
  }

  function formatFileSize(bytes) {
    if (!bytes) return '--'
    const mb = bytes / (1024 * 1024)
    if (mb < 1000) return `${mb.toFixed(1)} MB`
    return `${(mb / 1024).toFixed(2)} GB`
  }

  function formatDate(dateStr) {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleDateString('en-PK', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  if (loading && recordings.length === 0) return <LoadingSpinner />

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>
          Recorded <span className="gradient-text">Archives</span>
        </h1>
        <p style={{ color: 'var(--text-tertiary)' }}>Manage and publish class recordings for students</p>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <select
          className="input"
          value={processingFilter}
          onChange={e => { setProcessingFilter(e.target.value); setPage(1) }}
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value="">All Processing</option>
          <option value="ready">Ready</option>
          <option value="processing">Processing</option>
          <option value="recording">Recording</option>
          <option value="failed">Failed</option>
        </select>
        <select
          className="input"
          value={courseFilter}
          onChange={e => { setCourseFilter(e.target.value); setPage(1) }}
          style={{ width: 'auto', minWidth: 180 }}
        >
          <option value="">All Courses</option>
          {courseOptions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
          {pagination?.total || 0} recordings
        </span>
      </div>

      {/* Recordings Table */}
      {recordings.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <Film size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <h3>No recordings found</h3>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 8 }}>
            Recordings will appear here after live classes are recorded.
          </p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Recording</th>
                  <th className="hide-mobile">Course</th>
                  <th>Processing</th>
                  <th>Publication</th>
                  <th className="hide-mobile">Duration</th>
                  <th className="hide-mobile">Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recordings.map((rec) => {
                  const procConfig = PROCESSING_CONFIG[rec.processing_status] || PROCESSING_CONFIG.not_started
                  const pubConfig = PUBLICATION_CONFIG[rec.publication_status] || PUBLICATION_CONFIG.draft
                  const isReady = rec.processing_status === 'ready'
                  const isPublished = rec.publication_status === 'published'
                  const isActionLoading = actionLoading === rec.id

                  return (
                    <tr key={rec.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 'var(--radius-md)',
                              background: isPublished ? 'var(--gradient-mint)' : 'var(--gradient-cool)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              flexShrink: 0
                            }}
                          >
                            <Film size={18} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                              {rec.title}
                            </p>
                            {rec.lesson_order != null && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                Lesson {rec.lesson_order}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hide-mobile">
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {rec.courses?.title || '--'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${procConfig.badge}`}>
                          {procConfig.label}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${pubConfig.badge}`}>
                          {isPublished ? <><Eye size={10} /> {pubConfig.label}</> : <><EyeOff size={10} /> {pubConfig.label}</>}
                        </span>
                      </td>
                      <td className="hide-mobile">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {formatDuration(rec.duration_seconds)}
                        </span>
                      </td>
                      <td className="hide-mobile">
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {formatFileSize(rec.file_size_bytes)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                          {isReady && !isPublished && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => openPublishModal(rec)}
                              title="Publish recording to enrolled students"
                            >
                              <Eye size={14} /> Publish
                            </button>
                          )}
                          {isPublished && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleUnpublish(rec.id)}
                              disabled={isActionLoading}
                              style={{ color: 'var(--amber)' }}
                              title="Unpublish recording"
                            >
                              {isActionLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <EyeOff size={14} />}
                              Unpublish
                            </button>
                          )}
                          {!isReady && rec.processing_status !== 'failed' && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Loader2 size={12} style={{ animation: 'spin 2s linear infinite' }} />
                              Encoding
                            </span>
                          )}
                          {rec.processing_status === 'failed' && (
                            <span
                              style={{ fontSize: '0.78rem', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'help' }}
                              title="Recording aborted: LiveKit did not receive camera/microphone audio/video before recording ended."
                            >
                              <AlertCircle size={12} /> No Media Stream
                            </span>
                          )}

                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(rec.id)}
                            disabled={isActionLoading}
                            style={{ color: 'var(--text-muted)', padding: '0.35rem 0.5rem' }}
                            title="Delete this recording"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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

      {/* Publish Modal */}
      <Modal
        isOpen={!!publishModal}
        onClose={() => setPublishModal(null)}
        title="Publish Recording"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setPublishModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePublish} disabled={publishing}>
              {publishing ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Publishing...</> : <><Eye size={14} /> Publish to Students</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="input-group">
            <label>Title</label>
            <input className="input" value={publishData.title} onChange={e => setPublishData(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea className="input" rows={3} value={publishData.description} onChange={e => setPublishData(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Lesson Order</label>
            <input className="input" type="number" min={0} value={publishData.lesson_order} onChange={e => setPublishData(p => ({ ...p, lesson_order: Number(e.target.value) }))} />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lower numbers appear first in the student video library</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={publishData.allow_download}
              onChange={e => setPublishData(p => ({ ...p, allow_download: e.target.checked }))}
              style={{ accentColor: 'var(--mint)' }}
            />
            Allow students to download this recording
          </label>

          {publishModal && (
            <div style={{ padding: 'var(--space-4)', background: 'var(--glass-bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <p><strong>Duration:</strong> {formatDuration(publishModal.duration_seconds)}</p>
              <p><strong>Size:</strong> {formatFileSize(publishModal.file_size_bytes)}</p>
              <p><strong>Course:</strong> {publishModal.courses?.title || '--'}</p>
            </div>
          )}
        </div>
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}