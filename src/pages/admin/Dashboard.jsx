import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign, Users, ClipboardList, Calendar,
  BookOpen, TrendingUp, Clock, CheckCircle2,
  XCircle, ArrowRight, AlertCircle, Package,
  GraduationCap, Video, Film
} from 'lucide-react'
import { adminApi } from '../../services/api'
import StatCard from '../../components/StatCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { toast } from '../../components/Toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeStudents: 0,
    pendingEnrollments: 0,
    scheduledClasses: 0,
    totalCourses: 0,
    totalPackages: 0,
    totalRecordings: 0
  })
  const [recentEnrollments, setRecentEnrollments] = useState([])
  const [upcomingClasses, setUpcomingClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          enrollRes,
          coursesRes,
          packagesRes,
          classesRes,
          recordingsRes,
          studentsRes
        ] = await Promise.all([
          adminApi.getEnrollments({ per_page: 5 }),
          adminApi.getCourses({ per_page: 1 }),
          adminApi.getPackages({ per_page: 1 }),
          adminApi.getLiveClasses({ status: 'scheduled', per_page: 5 }),
          adminApi.getRecordings({ per_page: 1 }),
          adminApi.getStudents({ per_page: 1 })
        ])

        const enrollments = enrollRes.data || []
        const pending = enrollments.filter(e => e.status === 'pending')
        const approved = enrollments.filter(e => e.status === 'approved')
        const revenue = approved.reduce((sum, e) => sum + (e.amount || 0), 0)

        setStats({
          totalRevenue: revenue,
          activeStudents: studentsRes.meta?.total || 0,
          pendingEnrollments: pending.length,
          scheduledClasses: classesRes.meta?.total || classesRes.data?.length || 0,
          totalCourses: coursesRes.meta?.total || 0,
          totalPackages: packagesRes.meta?.total || 0,
          totalRecordings: recordingsRes.meta?.total || 0
        })

        setRecentEnrollments(enrollments.slice(0, 5))
        setUpcomingClasses(classesRes.data || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  function formatDate(dateStr) {
    if (!dateStr) return '--'
    return new Date(dateStr).toLocaleDateString('en-PK', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>
          Admin <span className="gradient-text">Overview</span>
        </h1>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Monitor your platform performance at a glance
        </p>
      </div>

      {/* KPI Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-5)',
          marginBottom: 'var(--space-8)'
        }}
      >
        <StatCard
          icon={DollarSign}
          value={`PKR ${new Intl.NumberFormat('en-PK').format(stats.totalRevenue)}`}
          label="Total Revenue"
          color="mint"
        />
        <StatCard
          icon={GraduationCap}
          value={stats.activeStudents}
          label="Active Students"
          color="sky"
        />
        <StatCard
          icon={Clock}
          value={stats.pendingEnrollments}
          label="Pending Enrollments"
          color="peach"
        />
        <StatCard
          icon={Calendar}
          value={stats.scheduledClasses}
          label="Scheduled Classes"
          color="lavender"
        />
      </div>

      {/* Secondary Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)'
        }}
      >
        {[
          { icon: BookOpen, label: 'Courses', value: stats.totalCourses, to: '/admin/courses' },
          { icon: Package, label: 'Packages', value: stats.totalPackages, to: '/admin/packages' },
          { icon: Film, label: 'Recordings', value: stats.totalRecordings, to: '/admin/recordings' },
          { icon: Video, label: 'Live Classes', value: stats.scheduledClasses, to: '/admin/live-classes' }
        ].map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="glass-card"
            style={{
              padding: 'var(--space-5)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              textDecoration: 'none',
              color: 'var(--text-primary)'
            }}
          >
            <item.icon size={20} style={{ color: 'var(--mint)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800 }}>
                {item.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-6)'
        }}
      >
        {/* Recent Enrollments */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <h3 style={{ fontSize: '1.05rem' }}>
              <ClipboardList size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--peach)' }} />
              Recent Enrollments
            </h3>
            <Link to="/admin/enrollments" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentEnrollments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>
              No enrollments yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {recentEnrollments.map((e) => {
                const name = e.profiles?.full_name || 'Unknown'
                const course = e.courses?.title || e.course_packages?.name || 'Unknown'
                const statusBadge = {
                  pending: 'badge-amber',
                  approved: 'badge-mint',
                  rejected: 'badge-rose',
                  cancelled: 'badge-rose',
                  completed: 'badge-sky'
                }

                return (
                  <div
                    key={e.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3)',
                      background: 'var(--glass-bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      gap: 'var(--space-2)'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {course}
                      </p>
                    </div>
                    <span className={`badge ${statusBadge[e.status]}`}>
                      {e.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <h3 style={{ fontSize: '1.05rem' }}>
              <Calendar size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--sky)' }} />
              Upcoming Classes
            </h3>
            <Link to="/admin/live-classes" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {upcomingClasses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>
              No scheduled classes
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {upcomingClasses.slice(0, 5).map((cls) => (
                <div
                  key={cls.id}
                  style={{
                    padding: 'var(--space-3)',
                    background: 'var(--glass-bg-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {cls.title}
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{cls.courses?.title}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{formatDate(cls.scheduled_start)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}