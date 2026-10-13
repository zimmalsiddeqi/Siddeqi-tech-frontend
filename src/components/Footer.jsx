import { Link } from 'react-router-dom'
import { BookOpen, Package, User, Sparkles, Youtube, ExternalLink, ShieldCheck } from 'lucide-react'

export function WhatsAppIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.9 12.03 8.02 12.19C8.14 12.35 9.75 14.84 12.21 15.91C12.8 16.16 13.25 16.32 13.61 16.43C14.19 16.62 14.73 16.59 15.15 16.53C15.62 16.46 16.6 15.94 16.8 15.37C17.01 14.81 17.01 14.33 16.95 14.23C16.89 14.13 16.73 14.07 16.49 13.95C16.25 13.83 15.07 13.25 14.85 13.17C14.63 13.09 14.47 13.05 14.31 13.29C14.15 13.53 13.69 14.07 13.55 14.23C13.41 14.39 13.27 14.41 13.03 14.29C12.79 14.17 12.02 13.92 11.11 13.11C10.4 12.48 9.92 11.7 9.8 11.46C9.68 11.22 9.79 11.09 9.91 10.97C10.02 10.86 10.16 10.68 10.28 10.54C10.4 10.4 10.44 10.3 10.52 10.14C10.6 9.98 10.56 9.84 10.5 9.72C10.44 9.6 9.98 8.46 9.79 7.99C9.6 7.54 9.41 7.6 9.27 7.59C9.14 7.58 8.98 7.58 8.82 7.58C8.66 7.58 8.53 7.33 8.53 7.33Z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <>
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(12px)',
          padding: 'var(--space-12) 0 var(--space-8)'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-8)',
              marginBottom: 'var(--space-10)'
            }}
          >
            {/* Column 1: Brand & Identity */}
            <div>
              <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 'var(--space-4)' }}>
                <div className="brand-icon">
                  <Sparkles size={18} />
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  Shawkat <span style={{ color: 'var(--peach)' }}>Tech</span>
                </span>
              </Link>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 320 }}>
                Premier software engineering and AI education platform in Pakistan. Project-driven cohorts covering Full-Stack Web, AI Agents, and Automation.
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>
                Programs & Courses
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <li>
                  <Link to="/courses" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    All Courses Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/courses/full-stack-modern-web-engineering-CabdXh" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    Full-Stack Modern Web Engineering
                  </Link>
                </li>
                <li>
                  <Link to="/courses/web-development-through-ai-DD7S54" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    Web Development Through AI
                  </Link>
                </li>
                <li>
                  <Link to="/packages" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    Bundle Deals & Career Tracks
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Student Portal */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>
                Student Access
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <li>
                  <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    Student & Instructor Portal Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    Create Student Account
                  </Link>
                </li>
                <li>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Live Online & Recorded Replays
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Direct Inquiries */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>
                Direct Admissions & Support
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <a
                  href="https://wa.me/923440114925?text=Hello%20Shawkat%20Tech%2C%20I%20have%20an%20inquiry%20about%20your%20courses."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#25D366',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <WhatsAppIcon size={16} color="#25D366" />
                  <span>WhatsApp: +92 344 0114925</span>
                </a>
                <a
                  href="https://www.youtube.com/@shawkatsiddeqi"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Youtube size={16} color="#FF0000" />
                  <span>YouTube Channel</span>
                  <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
                </a>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Islamabad, Pakistan &bull; Worldwide Online Access
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 'var(--space-6)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-4)'
            }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              &copy; {new Date().getFullYear()} Shawkat Siddeqi Tech. All rights reserved. Built for technical excellence.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
              Verified by Google Search Console &bull; SSL Secured
            </p>
          </div>
        </div>
      </footer>

      {/* ======== FLOATING WHATSAPP CTA WIDGET ======== */}
      <a
        href="https://wa.me/923440114925?text=Hello%20Shawkat%20Tech%2C%20I%20would%20like%20to%20inquire%20about%20your%20courses."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        title="Chat with Shawkat Tech on WhatsApp (+92 344 0114925)"
        aria-label="Chat on WhatsApp (+92 344 0114925)"
      >
        <WhatsAppIcon size={22} color="white" />
        <span>Chat on WhatsApp</span>
      </a>
    </>
  )
}
