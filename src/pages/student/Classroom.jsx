import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  useRoomContext,
  useParticipants,
  useLocalParticipant,
  useChat,
  ChatEntry
} from '@livekit/components-react'
import { Track, RoomEvent, ConnectionState } from 'livekit-client'
import {
  ArrowLeft, Users, MessageCircle, X, Send,
  Loader2, AlertCircle, Video, Signal, Film, StopCircle
} from 'lucide-react'
import { studentApi, adminApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import LiveBadge from '../../components/LiveBadge'
import { toast } from '../../components/Toast'
import '@livekit/components-styles'

export default function Classroom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [token, setToken] = useState(null)
  const [livekitUrl, setLivekitUrl] = useState(null)
  const [roomId, setRoomId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await studentApi.getJoinToken(id)
        setToken(res.data.token)
        setLivekitUrl(res.data.livekit_url)
        setRoomId(res.data.room_id)
      } catch (err) {
        const msg = err.message || 'Unable to join class'
        setError(msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchToken()
  }, [id])

  function handleLeave() {
    toast.success('Left the classroom')
    if (profile?.role === 'admin' || profile?.role === 'instructor') {
      navigate('/admin/live-classes')
    } else {
      navigate('/portal/live-classes')
    }
  }

  // ---- Loading ----
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-base)',
          padding: 'var(--space-6)'
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-4)',
            boxShadow: 'var(--shadow-glow-mint)',
            animation: 'pulse-soft 2s ease-in-out infinite'
          }}
        >
          <Video size={32} color="white" />
        </div>
        <h3 style={{ marginBottom: 'var(--space-2)' }}>Joining Classroom...</h3>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
          Setting up your secure connection
        </p>
      </div>
    )
  }

  // ---- Error ----
  if (error || !token) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          background: 'var(--bg-base)'
        }}
      >
        <div
          className="glass-card-strong"
          style={{ maxWidth: 480, padding: 'var(--space-10)', textAlign: 'center' }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              background: 'var(--rose-light)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-4)',
              color: 'var(--rose)'
            }}
          >
            <AlertCircle size={32} />
          </div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>Cannot Join Class</h3>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
            {error || 'Unable to generate access token.'}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
            Possible reasons:
            <br />• The class is not currently live
            <br />• You don't have access to this course
            <br />• Your enrollment is still pending approval
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={profile?.role === 'admin' || profile?.role === 'instructor' ? '/admin/live-classes' : '/portal/live-classes'} className="btn btn-primary">
              <ArrowLeft size={16} /> Back to Classes
            </Link>
            {profile?.role !== 'admin' && (
              <Link to="/portal/enrollments" className="btn btn-glass">
                Check Enrollments
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ---- Classroom ----
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0F172A',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <LiveKitRoom
        serverUrl={livekitUrl}
        token={token}
        connect={true}
        video={false}
        audio={false}
        onDisconnected={handleLeave}
        onError={(err) => {
          console.error('LiveKit error:', err)
          toast.error('Connection error: ' + err.message)
        }}
        data-lk-theme="default"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <ClassroomUI
          roomId={roomId}
          userName={profile?.full_name}
          onLeave={handleLeave}
          classId={id}
          isInstructor={profile?.role === 'admin' || profile?.role === 'instructor'}
        />
        <RoomAudioRenderer />
      </LiveKitRoom>

      <style>{`
        [data-lk-theme='default'] {
          --lk-bg: #0F172A;
          --lk-fg: #F8FAFC;
          --lk-accent-bg: #10B981;
          --lk-accent-fg: #FFFFFF;
          --lk-danger: #F43F5E;
          --lk-success: #10B981;
          --lk-control-bg: rgba(255,255,255,0.08);
          --lk-control-hover-bg: rgba(255,255,255,0.15);
          --lk-control-active-bg: #10B981;
          --lk-border-color: rgba(255,255,255,0.1);
          --lk-grid-gap: 8px;
        }

        .lk-control-bar {
          background: rgba(15, 23, 42, 0.85) !important;
          backdrop-filter: blur(20px) !important;
          border-top: 1px solid rgba(255,255,255,0.1) !important;
          padding: 1rem !important;
        }

        .lk-button {
          border-radius: var(--radius-full) !important;
          transition: all 200ms ease !important;
        }

        .lk-button:hover {
          transform: translateY(-2px) !important;
        }

        .lk-disconnect-button {
          background: #F43F5E !important;
          color: white !important;
        }
      `}</style>
    </div>
  )
}

// ============================================
// Classroom Inner UI (uses LiveKit hooks)
// ============================================

function ClassroomUI({ roomId, userName, onLeave, classId, isInstructor }) {
  const room = useRoomContext()
  const participants = useParticipants()
  const [sidebarTab, setSidebarTab] = useState(null) // 'chat' | 'participants' | null
  const [connectionState, setConnectionState] = useState(ConnectionState.Connecting)
  const [isRecording, setIsRecording] = useState(false)
  const [recLoading, setRecLoading] = useState(false)

  async function handleToggleRecording() {
    setRecLoading(true)
    try {
      if (!isRecording) {
        await adminApi.startRecording(classId)
        setIsRecording(true)
        toast.success('Recording started! Capturing live audio/video.')
      } else {
        await adminApi.stopRecording(classId)
        setIsRecording(false)
        toast.success('Recording stopped. Finalizing video file.')
      }
    } catch (err) {
      toast.error(err.message || 'Recording action failed')
    } finally {
      setRecLoading(false)
    }
  }

  useEffect(() => {
    if (!room) return

    const handleStateChange = (state) => {
      setConnectionState(state)
      if (state === ConnectionState.Connected) {
        toast.success('Connected to classroom')
      } else if (state === ConnectionState.Disconnected) {
        toast.error('Disconnected from classroom')
      } else if (state === ConnectionState.Reconnecting) {
        toast.loading('Reconnecting...')
      }
    }

    room.on(RoomEvent.ConnectionStateChanged, handleStateChange)
    return () => {
      room.off(RoomEvent.ConnectionStateChanged, handleStateChange)
    }
  }, [room])

  return (
    <>
      {/* ==== HEADER BAR ==== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-5)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          color: '#F8FAFC',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button
            onClick={onLeave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.5rem 0.9rem',
              background: 'rgba(255,255,255,0.08)',
              color: '#F8FAFC',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={14} /> Leave
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <LiveBadge />
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
              Room: {roomId?.slice(-8)}
            </span>
          </div>

          {/* Connection status */}
          {connectionState !== ConnectionState.Connected && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '0.25rem 0.6rem',
                background: 'rgba(245,158,11,0.15)',
                color: '#F59E0B',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}
            >
              <Signal size={10} />
              {connectionState}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {isInstructor && (
            <button
              onClick={handleToggleRecording}
              disabled={recLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.5rem 0.9rem',
                background: isRecording ? '#EF4444' : 'rgba(239, 68, 68, 0.15)',
                color: isRecording ? '#FFFFFF' : '#F87171',
                border: isRecording ? '1px solid #DC2626' : '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-full)',
                cursor: recLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              title={isRecording ? "Stop recording this class" : "Start recording this class"}
            >
              {recLoading ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : isRecording ? (
                <StopCircle size={14} />
              ) : (
                <Film size={14} />
              )}
              <span>{recLoading ? 'Updating...' : isRecording ? 'Stop Recording' : 'Start Recording'}</span>
            </button>
          )}

          <button
            onClick={() => setSidebarTab(sidebarTab === 'participants' ? null : 'participants')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.5rem 0.9rem',
              background: sidebarTab === 'participants' ? '#10B981' : 'rgba(255,255,255,0.08)',
              color: '#F8FAFC',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 500
            }}
          >
            <Users size={14} />
            {participants.length}
          </button>

          <button
            onClick={() => setSidebarTab(sidebarTab === 'chat' ? null : 'chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.5rem 0.9rem',
              background: sidebarTab === 'chat' ? '#10B981' : 'rgba(255,255,255,0.08)',
              color: '#F8FAFC',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 500
            }}
          >
            <MessageCircle size={14} />
            Chat
          </button>
        </div>
      </div>

      {/* ==== MAIN STAGE ==== */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Video Grid */}
        <div
          style={{
            flex: 1,
            background: '#0A0F1A',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <VideoGrid />
        </div>

        {/* Sidebar Drawer */}
        {sidebarTab && (
          <div
            style={{
              width: '340px',
              maxWidth: '100vw',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              color: '#F8FAFC',
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4) var(--space-5)',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <h4 style={{ color: 'white', fontSize: '0.95rem', margin: 0, textTransform: 'capitalize' }}>
                {sidebarTab}
              </h4>
              <button
                onClick={() => setSidebarTab(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: 'white',
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {sidebarTab === 'chat' && <ChatPanel />}
            {sidebarTab === 'participants' && <ParticipantsPanel participants={participants} />}
          </div>
        )}
      </div>

      {/* ==== CONTROL BAR ==== */}
      <ControlBar
        controls={{
          microphone: true,
          camera: true,
          screenShare: true,
          chat: false,
          leave: true
        }}
      />

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .lk-control-bar button span {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}

// ============================================
// Video Grid (uses LiveKit tracks)
// ============================================

function VideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false }
    ],
    { onlySubscribed: false }
  )

  if (tracks.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748B',
          gap: 'var(--space-4)',
          padding: 'var(--space-6)'
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Video size={32} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ color: '#F8FAFC', marginBottom: 6 }}>Waiting for instructor...</h4>
          <p style={{ fontSize: '0.88rem', color: '#64748B', maxWidth: 320 }}>
            The video stream will appear here once the instructor turns on their camera or shares their screen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <GridLayout tracks={tracks} style={{ height: '100%' }}>
      <ParticipantTile />
    </GridLayout>
  )
}

// ============================================
// Chat Panel
// ============================================

function ChatPanel() {
  const { chatMessages, send, isSending } = useChat()
  const [message, setMessage] = useState('')

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    try {
      await send(message.trim())
      setMessage('')
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}
      >
        {chatMessages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#64748B',
              fontSize: '0.85rem',
              padding: 'var(--space-6)'
            }}
          >
            <MessageCircle size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.05)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem'
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#10B981',
                  fontWeight: 600,
                  marginBottom: 4
                }}
              >
                {msg.from?.name || msg.from?.identity || 'Anonymous'}
              </div>
              <div style={{ color: '#F8FAFC', wordBreak: 'break-word' }}>{msg.message}</div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#64748B',
                  marginTop: 4,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString('en-PK', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          padding: 'var(--space-4)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          gap: 'var(--space-2)'
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '0.6rem 0.9rem',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-full)',
            color: '#F8FAFC',
            fontSize: '0.88rem',
            outline: 'none',
            fontFamily: 'var(--font-body)'
          }}
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--gradient-mint)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: !message.trim() || isSending ? 0.5 : 1
          }}
        >
          {isSending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
        </button>
      </form>
    </div>
  )
}

// ============================================
// Participants Panel
// ============================================

function ParticipantsPanel({ participants }) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)'
      }}
    >
      {participants.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: '#64748B',
            padding: 'var(--space-6)'
          }}
        >
          <Users size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: '0.85rem' }}>No participants yet</p>
        </div>
      ) : (
        participants.map((participant) => {
          const isLocal = participant.isLocal
          const isMicOn = participant.isMicrophoneEnabled
          const isCamOn = participant.isCameraEnabled
          const isScreenSharing = participant.isScreenShareEnabled

          return (
            <div
              key={participant.sid}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: isLocal ? 'var(--gradient-mint)' : 'var(--gradient-cool)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}
              >
                {(participant.name || participant.identity).charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: '#F8FAFC',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {participant.name || participant.identity}
                  {isLocal && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: '0.7rem',
                        color: '#10B981',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      (you)
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: '0.7rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: isMicOn ? '#10B981' : '#F43F5E' }}>
                    🎤 {isMicOn ? 'On' : 'Off'}
                  </span>
                  <span style={{ color: isCamOn ? '#10B981' : '#64748B' }}>
                    📹 {isCamOn ? 'On' : 'Off'}
                  </span>
                  {isScreenSharing && (
                    <span style={{ color: '#A78BFA' }}>🖥️ Sharing</span>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}