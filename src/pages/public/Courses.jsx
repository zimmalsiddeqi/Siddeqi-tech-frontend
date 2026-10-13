import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, BookOpen, X } from 'lucide-react'
import { publicApi } from '../../services/api'
import CourseCard from '../../components/CourseCard'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await publicApi.getCourses({
        page,
        per_page: 9,
        search: debouncedSearch || undefined
      })
      setCourses(res.data || [])
      setPagination(res.meta || null)
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return (
    <section className="page-section">
      <div className="container">
        {/* Header & Search */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)'
          }}
        >
          <div>
            <h1>
              Course <span className="gradient-text">Catalog</span>
            </h1>
            <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-2)', fontSize: '1.05rem' }}>
              Browse our complete collection of AI and web development courses
            </p>
          </div>

          {/* Search Controls Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              flexWrap: 'wrap'
            }}
          >
            {/* Modern Professional Search Bar */}
            <div className="courses-search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by title, topic, or technology..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="search-clear-btn"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Live Count */}
            {pagination && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: '0.875rem',
                  color: 'var(--text-tertiary)'
                }}
              >
                <span className="badge badge-mint">{pagination.total}</span>
                <span>{pagination.total === 1 ? 'course' : 'courses'} available</span>
              </div>
            )}
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : courses.length > 0 ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 'var(--space-6)'
              }}
            >
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  marginTop: 'var(--space-10)'
                }}
              >
                <button
                  className="btn btn-glass btn-sm"
                  disabled={!pagination.has_prev}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 var(--space-4)',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem'
                  }}
                >
                  {pagination.page} / {pagination.total_pages}
                </span>
                <button
                  className="btn btn-glass btn-sm"
                  disabled={!pagination.has_next}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookOpen size={28} />
            </div>
            <h3>No courses found</h3>
            <p>
              {debouncedSearch
                ? `No results for "${debouncedSearch}". Try a different search term.`
                : 'Courses will appear here once published.'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}