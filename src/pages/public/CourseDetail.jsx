import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Clock, Users, Play, CheckCircle2, BookOpen,
  ArrowLeft, Star, Zap, Monitor, ChevronDown, ChevronUp,
  Sparkles
} from 'lucide-react'
import { publicApi, studentApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/Toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import LiveBadge from '../../components/LiveBadge'

export default function CourseDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})
  const [isPortrait, setIsPortrait] = useState(false)

  // Detect image aspect ratio
  useEffect(() => {
    if (!course?.banner_url) return
    const img = new Image()
    img.src = course.banner_url
    img.onload = () => {
      setIsPortrait(img.naturalHeight > img.naturalWidth)
    }
  }, [course?.banner_url])

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await publicApi.getCourseBySlug(slug)
        setCourse(res.data)
        // Auto-expand first section
        if (res.data?.curriculum?.length > 0) {
          setExpandedSections({ 0: true })
        }
      } catch (err) {
        toast.error(err.message || 'Course not found')
        navigate('/courses')
      } finally {
        setLoading(false)
      }
    }
    loadCourse()
  }, [slug, navigate])

  const toggleSection = (index) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/courses/${slug}` } } })
      return
    }

    setEnrolling(true)
    try {
      await studentApi.createEnrollment({ course_id: course.id })
      toast.success('Enrollment request submitted! Awaiting admin approval.')
    } catch (err) {
      toast.error(err.message || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (!course) return null

  const {
    title,
    short_description,
    full_description,
    banner_url,
    technologies = [],
    learning_objectives = [],
    prerequisites = [],
    curriculum = [],
    duration,
    delivery_modes = [],
    price,
    currency = 'PKR',
    is_featured
  } = course

  const formattedPrice = new Intl.NumberFormat('en-PK').format(price)
  const totalLessons = curriculum.reduce((sum, s) => sum + (s.lessons?.length || 0), 0)

  return (
    <section className="page-section" style={{ paddingTop: 'var(--space-10)' }}>
      <div className="container">
        {/* Back Link */}
        <Link
          to="/courses"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-tertiary)',
            fontSize: '0.9rem',
            marginBottom: 'var(--space-6)'
          }}
        >
          <ArrowLeft size={16} /> Back to Courses
        </Link>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: 'var(--space-8)',
            alignItems: 'start'
          }}
        >
          {/* ---- LEFT: Content ---- */}
          <div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
              {is_featured && (
                <span className="badge badge-peach"><Star size={10} /> Featured</span>
              )}
              {delivery_modes.includes('live') && <LiveBadge text="LIVE CLASSES" />}
              {delivery_modes.includes('recorded') && (
                <span className="badge badge-sky"><Play size={10} /> Recorded</span>
              )}
            </div>

            <h1 style={{ marginBottom: 'var(--space-4)' }}>{title}</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>
              {short_description}
            </p>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
              {duration && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                  <Clock size={16} /> {duration}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                <BookOpen size={16} /> {totalLessons} Lessons
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                <Monitor size={16} /> {delivery_modes.join(', ')}
              </span>
            </div>

            {/* Banner — Adaptive Presentation (Portrait vs Landscape) */}
            {banner_url && (
              isPortrait ? (
                <div className="course-detail-portrait-grid">
                  {/* Portrait Box — exactly fitted 9:16 with zero empty sides */}
                  <div className="course-detail-banner-wrap-portrait">
                    <img
                      src={banner_url}
                      alt={title}
                    />
                  </div>

                  {/* Highlights Card completing the row seamlessly */}
                  <div
                    className="glass-card"
                    style={{
                      padding: 'var(--space-6)',
                      borderRadius: 'var(--radius-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 'var(--space-4)'
                    }}
                  >
                    <div>
                      <span className="badge badge-mint" style={{ marginBottom: 'var(--space-3)' }}>
                        <Sparkles size={11} /> Program Highlights
                      </span>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-3)' }}>
                        Course Overview
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                        {short_description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {[
                        { label: 'Instructor', value: 'Shawkat Siddeqi' },
                        { label: 'Delivery', value: delivery_modes.join(', ') || 'Live Interactive' },
                        { label: 'Content', value: `${totalLessons} Lessons in ${curriculum.length} Sections` },
                        { label: 'Access Level', value: 'Full Lifetime Access + Cloud Replay' }
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(255, 255, 255, 0.45)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>{item.label}</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Landscape Box — edge-to-edge widescreen 16:9 */
                <div className="course-detail-banner-wrap-landscape">
                  <img
                    src={banner_url}
                    alt={title}
                  />
                </div>
              )
            )}

            {/* Full Description */}
            {full_description && (
              <div style={{ marginBottom: 'var(--space-10)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>About This Course</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {full_description}
                </p>
              </div>
            )}

            {/* Learning Objectives */}
            {learning_objectives.length > 0 && (
              <div style={{ marginBottom: 'var(--space-10)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>What You'll Learn</h3>
                <div
                  className="glass-card"
                  style={{
                    padding: 'var(--space-6)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 'var(--space-4)'
                  }}
                >
                  {learning_objectives.map((obj, i) => (
                    <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                      <CheckCircle2
                        size={18}
                        style={{ color: 'var(--mint)', flexShrink: 0, marginTop: 2 }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {obj.title}
                        </p>
                        {obj.description && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                            {obj.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            {curriculum.length > 0 && (
              <div style={{ marginBottom: 'var(--space-10)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>
                  Curriculum
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                    {curriculum.length} sections · {totalLessons} lessons
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {curriculum.map((section, sIdx) => (
                    <div key={sIdx} className="glass-card" style={{ overflow: 'hidden' }}>
                      <button
                        onClick={() => toggleSection(sIdx)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-5) var(--space-6)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-display)',
                          fontSize: '1rem',
                          fontWeight: 600
                        }}
                      >
                        <span>
                          {section.section_title}
                          <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.82rem', marginLeft: 8 }}>
                            {section.lessons?.length || 0} lessons
                          </span>
                        </span>
                        {expandedSections[sIdx]
                          ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />
                          : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
                        }
                      </button>

                      {expandedSections[sIdx] && section.lessons && (
                        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          {section.lessons.map((lesson, lIdx) => (
                            <div
                              key={lIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--space-3) var(--space-6)',
                                borderBottom: lIdx < section.lessons.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <Play size={14} style={{ color: 'var(--mint)' }} />
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                  {lesson.title}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <span className="badge badge-sky" style={{ fontSize: '0.65rem' }}>
                                  {lesson.type}
                                </span>
                                {lesson.duration && (
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                    {lesson.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technologies */}
            {technologies.length > 0 && (
              <div style={{ marginBottom: 'var(--space-10)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Technologies</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {technologies.map((tech) => (
                    <span key={tech} className="tech-pill" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <div>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Prerequisites</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {prerequisites.map((pre, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <Zap size={14} style={{ color: 'var(--peach)' }} />
                      {pre}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ---- RIGHT: Sticky Enroll Card ---- */}
          <div style={{ position: 'sticky', top: 'calc(var(--navbar-height) + var(--space-6))' }}>
            <div className="glass-card-strong" style={{ padding: 'var(--space-8)' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    background: 'var(--gradient-mint)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {currency} {formattedPrice}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                  One-time payment · Lifetime access
                </p>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: 'var(--space-4)' }}
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Submitting...' : 'Enroll Now'}
              </button>

              <Link
                to="/packages"
                className="btn btn-glass btn-lg"
                style={{ width: '100%', textAlign: 'center' }}
              >
                View Bundle Deals
              </Link>

              <div
                style={{
                  marginTop: 'var(--space-6)',
                  paddingTop: 'var(--space-6)',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)'
                }}
              >
                {[
                  { icon: Play, text: `${totalLessons} lessons` },
                  { icon: Clock, text: duration || 'Self-paced' },
                  { icon: Monitor, text: 'Live + Recorded' },
                  { icon: Users, text: 'Community access' }
                ].map((item) => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <item.icon size={16} style={{ color: 'var(--mint)' }} />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}