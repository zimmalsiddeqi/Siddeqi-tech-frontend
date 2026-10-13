import { Link } from 'react-router-dom'
import { Compass, BookOpen, Layers, ArrowLeft } from 'lucide-react'
import SEO from '../../components/SEO'

export default function NotFound() {
  return (
    <section className="page-section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <SEO
        title="404 Page Not Found | Shawkat Siddeqi Tech"
        description="The page you requested could not be found. Explore our catalog of AI and software engineering courses."
        noindex={true}
      />
      <div className="container" style={{ textAlign: 'center', maxWidth: 640 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 'var(--radius-2xl)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#EF4444',
            marginBottom: 'var(--space-6)'
          }}
        >
          <Compass size={40} />
        </div>

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--peach)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 'var(--space-2)'
          }}
        >
          Error 404
        </p>

        <h1 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>
          Page Not Found
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            marginBottom: 'var(--space-8)'
          }}
        >
          The page you are looking for does not exist, may have been renamed, or is temporarily unavailable. Browse our courses to find what you need.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-8)'
          }}
        >
          <Link to="/courses" className="btn btn-primary btn-lg">
            <BookOpen size={18} /> Browse Courses
          </Link>
          <Link to="/packages" className="btn btn-secondary btn-lg">
            <Layers size={18} /> View Packages
          </Link>
          <Link to="/" className="btn btn-glass btn-lg">
            <ArrowLeft size={18} /> Back to Home
          </Link>
        </div>
      </div>
    </section>
  )
}
