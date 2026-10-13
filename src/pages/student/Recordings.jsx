import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  PlayCircle, Download, Clock, Video, X,
  Loader2, Film, Filter, Lock, AlertCircle
} from 'lucide-react'
import { studentApi } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { toast } from '../../components/Toast'

export default function StudentRecordings() {
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  const [playbackLoading, setPlaybackLoading] = useState(null) // recording id being loaded
  const [playerState, setPlayerState] = useState(null) // { url, title, allow_download }
  const [courseFilter, setCourseFilter] = useState('all')

  const fetchRecordings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await studentApi.getMyRecordings({ per_page: 50 })
      setRecordings(res.data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load recordings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecordings()
  }, [fetchRecordings])

  // Group by course
  const courseGroups = recordings.reduce((acc, rec) => {
    const courseId = rec.courses?.id || 'unknown'
    const courseName = rec.courses?.title || 'Other'
    if (!acc[courseId]) {
      acc[courseId] = { id: courseId, name: courseName, items: [] }
    }
    acc[courseId].items.push(rec)
    return acc
  }, {})

  const courses = Object.values(courseGroups)
  const filtered = courseFilter === 'all'
    ? recordings
    : recordings.filter(r => r.courses?.id === courseFilter)

  // Sort by lesson_order
  const sortedFiltered = [...filtered].sort((a, b) => {
    if (a.lesson_order == null) return 1
    if (b.lesson_order == null) return -1
    return a.lesson_order - b.lesson_order
  })

  async function handlePlay(recording) {
    setPlaybackLoading(recording.id)
    try {
      const res = await studentApi.getPlaybackAccess(recording.id)
      setPlayerState({
        url: res.data.playback_url,
        title: recording.title,
        allow_download: res.data.allow_download,
        recordingId: recording.id
      })
    } catch (err) {
      toast.error(err.message || 'Unable to load video')
    } finally {
      setPlaybackLoading(null)
    }
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
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    if (mb < 1000) return `${mb.toFixed(1)} MB`
    return `${(mb / 1024).toFixed(2)} GB`
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>
          Video <span className="gradient-text">Library</span>
        </h1>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Watch recorded lectures anytime, anywhere
        </p>
      </div>

      {recordings.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ margin: '0 auto var(--space-4)' }}>
            <Film size={28} />
          </div>
          <h3>No recordings yet</h3>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            Recorded lectures from your enrolled courses will appear here once published.
          </p>
          <Link to="/portal/live-classes" className="btn btn-primary">
            View Live Classes
          </Link>
        </div>
      ) : (
        <>
          {/* Course Filter */}
          {courses.length > 1 && (
            <div
              className="glass-card"
              style={{
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                flexWrap: 'wrap'
              }}
            >
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                Course:
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', flex: 1 }}>
                <button
                  onClick={() => setCourseFilter('all')}
                  className={courseFilter === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                >
                  All ({recordings.length})
                </button>
                {courses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCourseFilter(c.id)}
                    className={courseFilter === c.id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                  >
                    {c.name} ({c.items.length})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recordings Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'var(--space-5)'
            }}
          >
            {sortedFiltered.map((recording) => (
              <div
                key={recording.id}
                className="glass-card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                onClick={() => handlePlay(recording)}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    aspectRatio: '16 / 9',
                    background: 'var(--gradient-cool)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(14,165,233,0.3), rgba(167,139,250,0.3))'
                    }}
                  />
                  {playbackLoading === recording.id ? (
                    <Loader2 size={48} color="white" style={{ animation: 'spin 1s linear infinite', zIndex: 1 }} />
                  ) : (
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(255,255,255,0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                        boxShadow: 'var(--shadow-lg)',
                        transition: 'transform var(--transition-base)'
                      }}
                    >
                      <PlayCircle size={32} style={{ color: 'var(--mint)' }} />
                    </div>
                  )}

                  {/* Duration Overlay */}
                  {recording.duration_seconds && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        padding: '0.25rem 0.6rem',
                        background: 'rgba(0,0,0,0.75)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        zIndex: 1
                      }}
                    >
                      {formatDuration(recording.duration_seconds)}
                    </div>
                  )}

                  {/* Lesson Order */}
                  {recording.lesson_order != null && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        padding: '0.25rem 0.6rem',
                        background: 'rgba(255,255,255,0.95)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        zIndex: 1
                      }}
                    >
                      Lesson {recording.lesson_order}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {recording.courses?.title && (
                    <span className="badge badge-sky" style={{ marginBottom: 'var(--space-2)', alignSelf: 'flex-start' }}>
                      {recording.courses.title}
                    </span>
                  )}

                  <h4
                    style={{
                      marginBottom: 'var(--space-2)',
                      fontSize: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {recording.title}
                  </h4>

                  {recording.description && (
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-tertiary)',
                        marginBottom: 'var(--space-3)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1
                      }}
                    >
                      {recording.description}
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      paddingTop: 'var(--space-3)',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {formatDuration(recording.duration_seconds)}
                    </span>
                    {recording.allow_download && (
                      <span className="badge badge-mint" style={{ fontSize: '0.65rem' }}>
                        <Download size={9} /> Downloadable
                      </span>
                    )}
                    {!recording.allow_download && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={11} /> Stream Only
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ========== VIDEO PLAYER MODAL ========== */}
      {playerState && (
        <div
          onClick={() => setPlayerState(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 1100,
              background: 'var(--bg-soft)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              animation: 'fadeInUp 0.3s var(--ease-bounce)'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4) var(--space-6)',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <h4 style={{ fontSize: '1rem', margin: 0 }}>{playerState.title}</h4>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {playerState.allow_download && (
                  <a
                    href={playerState.url}
                    download
                    className="btn btn-glass btn-sm"
                  >
                    <Download size={14} /> Download
                  </a>
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPlayerState(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Video */}
            <div style={{ background: '#000', aspectRatio: '16 / 9' }}>
              <video
                src={playerState.url}
                controls
                autoPlay
                controlsList={playerState.allow_download ? '' : 'nodownload'}
                style={{ width: '100%', height: '100%' }}
              >
                Your browser does not support video playback.
              </video>
            </div>

            {/* Footer Info */}
            <div
              style={{
                padding: 'var(--space-4) var(--space-6)',
                background: 'var(--glass-bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                fontSize: '0.82rem',
                color: 'var(--text-tertiary)'
              }}
            >
              <AlertCircle size={14} />
              Playback link expires in 1 hour. Refresh if video stops working.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}