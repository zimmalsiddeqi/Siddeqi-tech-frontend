import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Check, Star, ArrowRight, Package, Zap, Sparkles
} from 'lucide-react'
import { publicApi, studentApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/Toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import SEO from '../../components/SEO'

export default function Packages() {
  const [packages, setPackages] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      try {
        const [pkgRes, coursesRes] = await Promise.all([
          publicApi.getPackages(),
          publicApi.getCourses({ per_page: 20 })
        ])
        setPackages(pkgRes.data || [])
        setCourses(coursesRes.data || [])
      } catch (err) {
        console.error('Failed to load packages:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleEnroll = async (packageId) => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      await studentApi.createEnrollment({ package_id: packageId })
      toast.success('Package enrollment submitted! Awaiting approval.')
    } catch (err) {
      toast.error(err.message || 'Enrollment failed')
    }
  }

  if (loading) return <LoadingSpinner fullScreen />

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://shawkattech.vercel.app'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Packages',
        item: 'https://shawkattech.vercel.app/packages'
      }
    ]
  }

  const packageListSchema = packages.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Course Packages and Career Bundles',
    itemListElement: packages.map((pkg, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: pkg.name,
      description: pkg.description || undefined
    }))
  } : null

  return (
    <section className="page-section">
      <SEO
        title="Course Bundles & Career Tracks | Shawkat Siddeqi Tech"
        description="Accelerate your technical career with all-in-one course bundles and AI tracks. Get full curriculum access, mentor guidance, and verified certificates at Shawkat Siddeqi Tech."
        canonical="/packages"
        schema={[breadcrumbsSchema, packageListSchema].filter(Boolean)}
      />
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.4rem 1rem',
              background: 'var(--peach-light)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#C2410C',
              marginBottom: 'var(--space-4)'
            }}
          >
            <Sparkles size={14} /> Best Value
          </div>
          <h1>
            Course <span className="gradient-text-warm">Packages</span> & Tracks
          </h1>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-3)', fontSize: '1.05rem', maxWidth: 560, margin: 'var(--space-3) auto 0' }}>
            Save more by bundling courses together. Get complete access to our entire AI and engineering curriculum.
          </p>
        </div>

        {packages.length === 0 && courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package size={28} />
            </div>
            <h2>No packages available yet</h2>
            <p>Check back soon for bundle deals.</p>
          </div>
        ) : (
          <>
            {/* Individual Courses */}
            {courses.length > 0 && (
              <div style={{ marginBottom: 'var(--space-12)' }}>
                <h2 style={{ marginBottom: 'var(--space-6)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.25rem' }}>
                  Individual Courses
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 'var(--space-6)'
                  }}
                >
                  {courses.map((course) => (
                    <div key={course.id} className="glass-card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ marginBottom: 'var(--space-2)', fontSize: '1.15rem' }}>{course.title}</h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)', flex: 1 }}>
                        {course.short_description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)'
                          }}
                        >
                          {course.currency} {new Intl.NumberFormat('en-PK').format(course.price)}
                        </span>
                        <Link to={`/courses/${course.slug}`} className="btn btn-glass btn-sm">
                          Details <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bundle Packages */}
            {packages.length > 0 && (
              <div>
                <h2 style={{ marginBottom: 'var(--space-6)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.25rem' }}>
                  Bundle Deals & Tracks
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: 'var(--space-6)'
                  }}
                >
                  {packages.map((pkg) => {
                    const includedCourses = pkg.course_package_items?.map(
                      (item) => item.courses
                    ).filter(Boolean) || []

                    const individualTotal = includedCourses.reduce(
                      (sum, c) => sum + (c.price || 0), 0
                    )
                    const savings = individualTotal - pkg.price

                    return (
                      <div
                        key={pkg.id}
                        className="glass-card-strong"
                        style={{
                          padding: 'var(--space-8)',
                          position: 'relative',
                          overflow: 'hidden',
                          border: pkg.is_featured ? '2px solid var(--mint)' : undefined
                        }}
                      >
                        {pkg.is_featured && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 16,
                              right: -30,
                              background: 'var(--gradient-mint)',
                              color: 'white',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.3rem 2.5rem',
                              transform: 'rotate(45deg)',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            BEST
                          </div>
                        )}

                        <h3 style={{ marginBottom: 'var(--space-2)' }}>{pkg.name}</h3>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: 'var(--space-6)' }}>
                          {pkg.description}
                        </p>

                        {/* Price */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                          <span
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
                            {pkg.currency} {new Intl.NumberFormat('en-PK').format(pkg.price)}
                          </span>
                          {savings > 0 && (
                            <span
                              className="badge badge-mint"
                              style={{ marginLeft: 'var(--space-3)', verticalAlign: 'middle' }}
                            >
                              Save {pkg.currency} {new Intl.NumberFormat('en-PK').format(savings)}
                            </span>
                          )}
                        </div>

                        {/* Included Courses */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
                            Includes:
                          </p>
                          {includedCourses.map((c) => (
                            <div
                              key={c.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                padding: 'var(--space-2) 0',
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              <Check size={16} style={{ color: 'var(--mint)', flexShrink: 0 }} />
                              {c.title}
                            </div>
                          ))}
                        </div>

                        <button
                          className={`btn ${pkg.is_featured ? 'btn-primary' : 'btn-secondary'} btn-lg`}
                          style={{ width: '100%' }}
                          onClick={() => handleEnroll(pkg.id)}
                        >
                          Enroll in Package
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}