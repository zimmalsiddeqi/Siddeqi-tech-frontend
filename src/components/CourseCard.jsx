import { Link } from 'react-router-dom'
import { Clock, ArrowRight, Star } from 'lucide-react'
import LiveBadge from './LiveBadge'
import { publicApi } from '../services/api'

export default function CourseCard({ course }) {
  if (!course) return null

  const {
    id,
    title,
    slug,
    short_description,
    banner_url,
    technologies = [],
    price,
    currency = 'PKR',
    duration,
    is_featured,
    delivery_modes = []
  } = course

  const formattedPrice = new Intl.NumberFormat('en-PK').format(price)
  const isLive = delivery_modes.includes('live')

  return (
    <Link
      to={`/courses/${slug}`}
      onMouseEnter={() => slug && publicApi.getCourseBySlug(slug)}
      style={{ textDecoration: 'none' }}
    >
      <div className="course-card">
        {/* Banner */}
        <div className="course-card-banner-wrap">
          {banner_url ? (
            <img
              src={banner_url}
              alt={title}
              className="course-card-banner"
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: 'rgba(255,255,255,0.3)',
                background: 'var(--gradient-cool)'
              }}
            >
              {title.charAt(0)}
            </div>
          )}

          {/* Overlays */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            {is_featured && (
              <span className="badge badge-peach">
                <Star size={10} /> Featured
              </span>
            )}
            {isLive && <LiveBadge />}
          </div>
        </div>

        {/* Body */}
        <div className="course-card-body">
          <h3 className="course-card-title">{title}</h3>
          <p className="course-card-desc">{short_description}</p>

          {/* Tech Pills */}
          {technologies.length > 0 && (
            <div className="course-card-techs">
              {technologies.slice(0, 4).map((tech) => (
                <span key={tech} className="tech-pill">{tech}</span>
              ))}
              {technologies.length > 4 && (
                <span className="tech-pill" style={{ background: 'var(--bg-tint)', color: 'var(--text-tertiary)' }}>
                  +{technologies.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="course-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <span className="course-price">
              {currency} {formattedPrice}
            </span>
            {duration && (
              <span className="text-muted" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} /> {duration}
              </span>
            )}
          </div>
          <span
            style={{
              color: 'var(--mint)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            View <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}