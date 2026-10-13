import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, X, Sparkles } from 'lucide-react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

export function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export function StudentLayout() {
  return <AppShell isAdmin={false} />
}

export function AdminLayout() {
  return <AppShell isAdmin={true} />
}

// Shared shell for student & admin with mobile sidebar
function AppShell({ isAdmin }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <div className="app-layout">
      {/* Mobile top bar */}
      <div className="mobile-topbar hide-desktop">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <div className="mobile-brand">
          <div className="brand-icon">
            <Sparkles size={16} />
          </div>
          <span className="gradient-text">Shawkat Tech</span>
        </div>
      </div>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop hide-desktop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isAdmin={isAdmin}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}