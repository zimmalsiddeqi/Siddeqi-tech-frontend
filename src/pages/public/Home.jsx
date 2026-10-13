import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Play, Users, BookOpen, Award,
  Sparkles, Zap, Globe, ChevronRight, Star, CheckCircle2,
  Video, Laptop
} from 'lucide-react'
import { publicApi } from '../../services/api'
import CourseCard from '../../components/CourseCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import SEO from '../../components/SEO'

function WhatsAppIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.9 12.03 8.02 12.19C8.14 12.35 9.75 14.84 12.21 15.91C12.8 16.16 13.25 16.32 13.61 16.43C14.19 16.62 14.73 16.59 15.15 16.53C15.62 16.46 16.6 15.94 16.8 15.37C17.01 14.81 17.01 14.33 16.95 14.23C16.89 14.13 16.73 14.07 16.49 13.95C16.25 13.83 15.07 13.25 14.85 13.17C14.63 13.09 14.47 13.05 14.31 13.29C14.15 13.53 13.69 14.07 13.55 14.23C13.41 14.39 13.27 14.41 13.03 14.29C12.79 14.17 12.02 13.92 11.11 13.11C10.4 12.48 9.92 11.7 9.8 11.46C9.68 11.22 9.79 11.09 9.91 10.97C10.02 10.86 10.16 10.68 10.28 10.54C10.4 10.4 10.44 10.3 10.52 10.14C10.6 9.98 10.56 9.84 10.5 9.72C10.44 9.6 9.98 8.46 9.79 7.99C9.6 7.54 9.41 7.6 9.27 7.59C9.14 7.58 8.98 7.58 8.82 7.58C8.66 7.58 8.53 7.33 8.53 7.33Z" />
    </svg>
  )
}

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [featuredRes, coursesRes] = await Promise.all([
          publicApi.getFeaturedCourses(),
          publicApi.getCourses({ per_page: 6 })
        ])
        setFeaturedCourses(featuredRes.data || [])
        setAllCourses(coursesRes.data || [])
      } catch (err) {
        console.error('Failed to load homepage data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const displayCourses = featuredCourses.length > 0 ? featuredCourses : allCourses

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    )

    const elements = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)')
    elements.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
    }
  }, [displayCourses, loading])

  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://shawkattech.vercel.app/#website',
        'url': 'https://shawkattech.vercel.app/',
        'name': 'Shawkat Siddeqi Tech',
        'description': 'Master modern Web Development through AI, autonomous AI Agents with n8n, and full-stack software engineering. Live interactive online classes in Pakistan with HD cloud recordings.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://shawkattech.vercel.app/courses?search={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://shawkattech.vercel.app/#organization',
        'name': 'Shawkat Siddeqi Tech',
        'url': 'https://shawkattech.vercel.app/',
        'logo': 'https://shawkattech.vercel.app/favicon.svg',
        'description': 'Premium online education platform in Pakistan offering live interactive courses in Web Development, AI Agents, and Automation workflows.',
        'telephone': '+923440114925',
        'address': {
          '@type': 'PostalAddress',
          'addressCountry': 'PK'
        },
        'sameAs': [
          'https://wa.me/923440114925'
        ]
      }
    ]
  }

  return (
    <>
      <SEO
        title="Online Courses in Pakistan | Learn Web Development & AI | Shawkat Siddeqi Tech"
        description="Master modern Web Development through AI, autonomous AI Agents with n8n, and full-stack software engineering. Live interactive online classes in Pakistan with HD cloud recordings."
        canonical="/"
        schema={homeSchema}
      />
      {/* ======== HERO SECTION ======== */}
      <section className="hero">
        {/* Floating Ambient Glowing Mesh Orbs */}
        <div className="hero-ambient-lights" aria-hidden="true">
          <div className="hero-orb hero-orb-mint" />
          <div className="hero-orb hero-orb-sky" />
          <div className="hero-orb hero-orb-peach" />
        </div>

        <div className="container">
          <div className="hero-content">
            {/* Live Tagline Badge */}
            <div className="hero-tagline animate-fade-in">
              <span className="live-status-dot" />
              <Sparkles size={14} style={{ color: 'var(--mint)' }} />
              <span>AI-Powered Learning for the Future</span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="hero-title animate-fade-in-up">
              Master <span className="gradient-text-hero">AI & Web</span>
              <br />Development
            </h1>

            {/* Hero Subtitle */}
            <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Learn modern Web Development through AI, build autonomous AI Agents with n8n,
              and create cinematic AI videos. Interactive live classes, real-world projects,
              and career-ready skills — all in one modern platform.
            </p>

            {/* Hero CTA Actions */}
            <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/courses" className="btn btn-primary btn-lg" style={{ boxShadow: 'var(--shadow-glow-mint)' }}>
                Explore Courses
                <ArrowRight size={18} />
              </Link>
              <Link to="/packages" className="btn btn-glass btn-lg">
                <Play size={16} />
                View Packages
              </Link>
              <a
                href="https://wa.me/923440114925?text=Hello%20Shawkat%20Tech%2C%20I%20would%20like%20to%20learn%20more%20about%20your%20courses."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
                title="Chat with Shawkat Tech on WhatsApp (+92 344 0114925)"
              >
                <WhatsAppIcon size={18} color="white" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Trust Stats Cards */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-10)',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              {[
                { value: '3+', label: 'Expert Courses', badge: 'Curated Tracks' },
                { value: 'HD Live', label: 'Interactive Classes', badge: 'WebRTC Powered' },
                { value: 'AI-First', label: 'Modern Curriculum', badge: 'Agents & n8n' }
              ].map((stat, idx) => (
                <div key={stat.label} className={`hero-stat-card-gradient reveal-on-scroll stagger-${idx + 1}`}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      background: 'var(--gradient-text)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.2
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: 3 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {stat.badge}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======== TECH MARQUEE (SMOOTH INFINITE LOOP) ======== */}
      <section className="marquee-wrapper">
        <div className="marquee-track">
          {[
            'React 18', 'AI Agents', 'n8n Automations', 'Fastify', 'Supabase',
            'LiveKit WebRTC', 'JavaScript', 'Node.js', 'PostgreSQL',
            'AI Video Generation', 'Full-Stack Workflows', 'Claude & OpenAI APIs',
            'React 18', 'AI Agents', 'n8n Automations', 'Fastify', 'Supabase',
            'LiveKit WebRTC', 'JavaScript', 'Node.js', 'PostgreSQL'
          ].map((tech, i) => (
            <span key={i} className="tech-pill-interactive">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ======== LEARNING WORKFLOW JOURNEY ======== */}
      <section className="page-section" style={{ paddingTop: 'var(--space-6)' }}>
        <div className="container">
          <div className="reveal-on-scroll" style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span className="badge badge-mint" style={{ marginBottom: 'var(--space-3)' }}>
              <Sparkles size={12} /> Student Experience
            </span>
            <h2>
              How Learning Works at <span className="gradient-text">Shawkat Tech</span>
            </h2>
            <p style={{ color: 'var(--text-tertiary)', maxWidth: 560, margin: 'var(--space-2) auto 0', fontSize: '1rem' }}>
              A seamless, high-performance learning pathway designed for practical success
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {[
              {
                step: '01',
                title: 'Choose Your Track',
                desc: 'Pick specialized programs in AI Web Development, AI Agents, or Bundle Packages.',
                icon: BookOpen,
                color: 'mint'
              },
              {
                step: '02',
                title: 'Join Live Classes',
                desc: 'Experience real-time interactive classes with screen sharing, direct Q&A, and live code reviews.',
                icon: Video,
                color: 'peach'
              },
              {
                step: '03',
                title: 'Replay in HD Cloud',
                desc: 'Missed a live class? Instant access to crisp HD recordings with full playback control anytime.',
                icon: Play,
                color: 'sky'
              },
              {
                step: '04',
                title: 'Build & Graduate',
                desc: 'Develop real AI projects, deploy portfolio apps, and earn verified completion credentials.',
                icon: Award,
                color: 'lavender'
              }
            ].map((item, idx) => (
              <div key={item.step} className={`step-card-gradient step-card-${item.color} reveal-on-scroll stagger-${idx + 1}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--text-muted)'
                    }}
                  >
                    {item.step}
                  </span>
                  <div className={`stat-card-icon ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                </div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: 'var(--space-2)' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FEATURED COURSES ======== */}
      <section className="page-section">
        <div className="container">
          <div
            className="reveal-on-scroll"
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-10)',
              flexWrap: 'wrap',
              gap: 'var(--space-4)'
            }}
          >
            <div>
              <span className="badge badge-peach" style={{ marginBottom: 'var(--space-2)' }}>
                <Star size={11} /> Hand-Picked Programs
              </span>
              <h2>
                Featured <span className="gradient-text">Courses</span>
              </h2>
              <p style={{ marginTop: 'var(--space-2)', color: 'var(--text-tertiary)' }}>
                Accelerate your career with industry-proven AI curriculum
              </p>
            </div>
            <Link to="/courses" className="btn btn-glass btn-sm">
              View All Catalog <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : displayCourses.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 'var(--space-6)'
              }}
            >
              {displayCourses.slice(0, 6).map((course, idx) => (
                <div key={course.id} className={`reveal-on-scroll stagger-${(idx % 3) + 1}`}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <BookOpen size={28} />
              </div>
              <h3>No courses published yet</h3>
              <p>Check back soon or explore our packages.</p>
            </div>
          )}
        </div>
      </section>

      {/* ======== WHY CHOOSE US (INTERACTIVE FEATURE CARDS) ======== */}
      <section className="page-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="reveal-on-scroll" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span className="badge badge-sky" style={{ marginBottom: 'var(--space-2)' }}>
              <Globe size={11} /> The Shawkat Tech Advantage
            </span>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>
              Why Choose <span className="gradient-text">Shawkat Tech</span>?
            </h2>
            <p
              style={{
                color: 'var(--text-tertiary)',
                maxWidth: 580,
                margin: '0 auto',
                fontSize: '1.025rem'
              }}
            >
              A high-touch learning experience engineered for rapid mastery in the AI era
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {[
              {
                icon: Zap,
                color: 'peach',
                title: 'Live Interactive Classes',
                desc: 'Real-time interactive classroom sessions with HD screen sharing, live coding, and instant instructor feedback.'
              },
              {
                icon: Play,
                color: 'sky',
                title: 'Instant Cloud Recordings',
                desc: 'Missed a session? Every class is automatically recorded in HD for unlimited on-demand replay from your student portal.'
              },
              {
                icon: Globe,
                color: 'mint',
                title: 'AI-First Curriculum',
                desc: 'Master the future: build custom AI agents with n8n, automate complex business workflows, and generate AI video assets.'
              },
              {
                icon: Award,
                color: 'lavender',
                title: 'Portfolio & Career Support',
                desc: 'Graduate with tangible deployed applications, real GitHub projects, and skills actively demanded by modern employers.'
              }
            ].map((feature, idx) => (
              <div key={feature.title} className={`feature-card-gradient feature-card-${feature.color} reveal-on-scroll stagger-${idx + 1}`}>
                <div className={`stat-card-icon ${feature.color}`} style={{ marginBottom: 'var(--space-4)' }}>
                  <feature.icon size={22} />
                </div>
                <h3 style={{ marginBottom: 'var(--space-2)', fontSize: '1.15rem' }}>{feature.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', lineHeight: 1.65 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CALL TO ACTION (LUXURY GRADIENT CARD) ======== */}
      <section className="page-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-card-gradient reveal-on-scroll">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--mint)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: 'var(--space-4)'
                }}
              >
                <Sparkles size={14} /> Start Your AI Learning Journey
              </div>

              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginBottom: 'var(--space-4)' }}>
                Ready to <span className="gradient-text">Transform Your Skills</span>?
              </h2>
              <p
                style={{
                  color: 'var(--text-tertiary)',
                  maxWidth: 540,
                  margin: '0 auto var(--space-8)',
                  fontSize: '1.05rem',
                  lineHeight: 1.6
                }}
              >
                Join ambitious students mastering AI engineering, automation, and modern web development.
                Sign up today and get access to your personal portal.
              </p>

              <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary btn-lg" style={{ boxShadow: 'var(--shadow-glow-mint)' }}>
                  Create Free Account
                  <ArrowRight size={18} />
                </Link>
                <Link to="/packages" className="btn btn-glass btn-lg">
                  View Bundle Packages
                </Link>
                <a
                  href="https://wa.me/923440114925?text=Hello%20Shawkat%20Tech%2C%20I%20have%20questions%20regarding%20course%20enrollment."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg"
                  title="Chat on WhatsApp (+92 344 0114925)"
                >
                  <WhatsAppIcon size={18} color="white" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}