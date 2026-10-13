import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Edit3, Trash2, Eye, Search,
  Loader2, BookOpen, X, Save, Image
} from 'lucide-react'
import { adminApi } from '../../services/api'
import Modal from '../../components/Modal'
import LoadingSpinner from '../../components/LoadingSpinner'
import { toast } from '../../components/Toast'
import ImageUpload from '../../components/ImageUpload'

const EMPTY_COURSE = {
  title: '',
  short_description: '',
  full_description: '',
  banner_url: '',
  category: '',
  technologies: [],
  learning_objectives: [],
  prerequisites: [],
  curriculum: [],
  duration: '',
  delivery_modes: ['live'],
  price: 0,
  currency: 'PKR',
  is_featured: false,
  status: 'draft',
  seo_title: '',
  seo_description: ''
}

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_COURSE)
  const [saving, setSaving] = useState(false)
  const [techInput, setTechInput] = useState('')

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getCourses({
        page,
        per_page: 10,
        search: search || undefined,
        status: statusFilter || undefined
      })
      setCourses(res.data || [])
      setPagination(res.meta || null)
    } catch (err) {
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (debouncedSearch !== search) return
    fetchCourses()
  }, [debouncedSearch, statusFilter, page])

  function openCreate() {
    setEditingId(null)
    setFormData(EMPTY_COURSE)
    setTechInput('')
    setModalOpen(true)
  }

  function openEdit(course) {
    setEditingId(course.id)
    setFormData({
      title: course.title || '',
      short_description: course.short_description || '',
      full_description: course.full_description || '',
      banner_url: course.banner_url || '',
      category: course.category || '',
      technologies: course.technologies || [],
      learning_objectives: course.learning_objectives || [],
      prerequisites: course.prerequisites || [],
      curriculum: course.curriculum || [],
      duration: course.duration || '',
      delivery_modes: course.delivery_modes || ['live'],
      price: course.price || 0,
      currency: course.currency || 'PKR',
      is_featured: course.is_featured || false,
      status: course.status || 'draft',
      seo_title: course.seo_title || '',
      seo_description: course.seo_description || ''
    })
    setTechInput('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.short_description.trim()) {
      toast.error('Title and short description are required')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await adminApi.updateCourse(editingId, formData)
        toast.success('Course updated successfully')
      } else {
        await adminApi.createCourse(formData)
        toast.success('Course created successfully')
      }
      setModalOpen(false)
      fetchCourses()
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Archive "${title}"? This will hide it from students.`)) return
    try {
      await adminApi.deleteCourse(id)
      toast.success('Course archived')
      fetchCourses()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  function addTech() {
    const t = techInput.trim()
    if (t && !formData.technologies.includes(t)) {
      setFormData(prev => ({ ...prev, technologies: [...prev.technologies, t] }))
    }
    setTechInput('')
  }

  function removeTech(tech) {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }

  const statusColors = {
    draft: 'badge-amber',
    published: 'badge-mint',
    archived: 'badge-rose'
  }

  if (loading && courses.length === 0) return <LoadingSpinner />

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>
            Course <span className="gradient-text">Manager</span>
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Create, edit, and manage your courses
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Course
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="input"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, border: 'none', background: 'transparent', boxShadow: 'none', padding: '0.4rem 0' }}
        />
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      {courses.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <BookOpen size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <h3>No courses found</h3>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 8 }}>Create your first course to get started.</p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th className="hide-mobile">Category</th>
                <th>Price</th>
                <th>Status</th>
                <th className="hide-mobile">Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--radius-md)',
                          background: course.banner_url ? `url(${course.banner_url}) center/cover` : 'var(--gradient-cool)',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 250 }}>
                          {course.title}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          /{course.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hide-mobile">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {course.category || '--'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--mint)' }}>
                      {course.currency} {new Intl.NumberFormat('en-PK').format(course.price)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${statusColors[course.status]}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="hide-mobile">
                    {course.is_featured ? (
                      <span className="badge badge-peach">Featured</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>--</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(course)} title="Edit">
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(course.id, course.title)}
                        title="Archive"
                        style={{ color: 'var(--rose)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
          <button className="btn btn-glass btn-sm" disabled={!pagination.has_prev} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 var(--space-3)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            {pagination.page}/{pagination.total_pages}
          </span>
          <button className="btn btn-glass btn-sm" disabled={!pagination.has_next} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Course' : 'Create New Course'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={14} /> Save</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="input-group">
            <label>Title *</label>
            <input className="input" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Web Development Through AI" />
          </div>

          <div className="input-group">
            <label>Short Description *</label>
            <textarea className="input" rows={2} value={formData.short_description} onChange={e => setFormData(p => ({ ...p, short_description: e.target.value }))} placeholder="Brief overview (shown on cards)" />
          </div>

          <div className="input-group">
            <label>Full Description</label>
            <textarea className="input" rows={4} value={formData.full_description} onChange={e => setFormData(p => ({ ...p, full_description: e.target.value }))} placeholder="Detailed course description" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label>Price (PKR) *</label>
              <input className="input" type="number" min={0} value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} />
            </div>
            <div className="input-group">
              <label>Duration</label>
              <input className="input" value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 8 Weeks" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label>Category</label>
              <input className="input" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} placeholder="e.g. AI, Web Dev" />
            </div>
            <div className="input-group">
              <label>Status</label>
              <select className="input" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <ImageUpload
            value={formData.banner_url}
            onChange={url => setFormData(p => ({ ...p, banner_url: url }))}
            folder="banners"
            label="Course Banner Image"
            helperText="Recommended: 1200x630 (16:9 ratio, max 5MB)"
            placeholder="Click or drag course banner here"
          />

          {/* Technologies */}
          <div className="input-group">
            <label>Technologies</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                className="input"
                value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech() } }}
                placeholder="Type and press Enter"
              />
              <button type="button" className="btn btn-glass btn-sm" onClick={addTech}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
              {formData.technologies.map(tech => (
                <span key={tech} className="tech-pill" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => removeTech(tech)}>
                  {tech} <X size={10} />
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={e => setFormData(p => ({ ...p, is_featured: e.target.checked }))}
                style={{ accentColor: 'var(--mint)' }}
              />
              Featured Course
            </label>
          </div>
        </div>
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}