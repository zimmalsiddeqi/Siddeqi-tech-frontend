import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Edit3, Trash2, Package, Loader2,
  Save, X, Check
} from 'lucide-react'
import { adminApi } from '../../services/api'
import Modal from '../../components/Modal'
import LoadingSpinner from '../../components/LoadingSpinner'
import { toast } from '../../components/Toast'

export default function AdminPackages() {
  const [packages, setPackages] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'PKR',
    is_featured: false,
    status: 'draft',
    course_ids: []
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pkgRes, coursesRes] = await Promise.all([
        adminApi.getPackages({ page, per_page: 10 }),
        adminApi.getCourses({ per_page: 100, status: 'published' })
      ])
      setPackages(pkgRes.data || [])
      setPagination(pkgRes.meta || null)
      setAllCourses(coursesRes.data || [])
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  function openCreate() {
    setEditingId(null)
    setFormData({ name: '', description: '', price: 0, currency: 'PKR', is_featured: false, status: 'draft', course_ids: [] })
    setModalOpen(true)
  }

  function openEdit(pkg) {
    setEditingId(pkg.id)
    const courseIds = pkg.course_package_items?.map(i => i.course_id) || []
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      currency: pkg.currency,
      is_featured: pkg.is_featured,
      status: pkg.status,
      course_ids: courseIds
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Name and description are required')
      return
    }
    if (formData.course_ids.length === 0) {
      toast.error('Select at least one course')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await adminApi.updatePackage(editingId, formData)
        toast.success('Package updated')
      } else {
        await adminApi.createPackage(formData)
        toast.success('Package created')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete package "${name}"?`)) return
    try {
      await adminApi.deletePackage(id)
      toast.success('Package deleted')
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  function toggleCourse(courseId) {
    setFormData(prev => ({
      ...prev,
      course_ids: prev.course_ids.includes(courseId)
        ? prev.course_ids.filter(id => id !== courseId)
        : [...prev.course_ids, courseId]
    }))
  }

  if (loading && packages.length === 0) return <LoadingSpinner />

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-1)' }}>
            Package <span className="gradient-text-warm">Manager</span>
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>Bundle courses into discounted packages</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Package
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-16)', textAlign: 'center' }}>
          <Package size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <h3>No packages yet</h3>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 8 }}>Create bundles to offer discounted course combinations.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-5)' }}>
          {packages.map((pkg) => {
            const courseCount = pkg.course_package_items?.length || 0
            const statusBadge = { draft: 'badge-amber', published: 'badge-mint', archived: 'badge-rose' }

            return (
              <div key={pkg.id} className="glass-card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <h4 style={{ marginBottom: 4 }}>{pkg.name}</h4>
                    <span className={`badge ${statusBadge[pkg.status]}`}>{pkg.status}</span>
                    {pkg.is_featured && <span className="badge badge-peach" style={{ marginLeft: 4 }}>Featured</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(pkg)}><Edit3 size={14} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rose)' }} onClick={() => handleDelete(pkg.id, pkg.name)}><Trash2 size={14} /></button>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
                  {pkg.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--mint)' }}>
                    {pkg.currency} {new Intl.NumberFormat('en-PK').format(pkg.price)}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {courseCount} course{courseCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Package' : 'Create Package'}
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
            <label>Package Name *</label>
            <input className="input" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Complete AI Bundle" />
          </div>
          <div className="input-group">
            <label>Description *</label>
            <textarea className="input" rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label>Price (PKR)</label>
              <input className="input" type="number" min={0} value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} />
            </div>
            <div className="input-group">
              <label>Status</label>
              <select className="input" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData(p => ({ ...p, is_featured: e.target.checked }))} style={{ accentColor: 'var(--mint)' }} />
            Featured Package
          </label>

          {/* Course Selection */}
          <div className="input-group">
            <label>Select Courses * ({formData.course_ids.length} selected)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: 240, overflowY: 'auto', padding: 'var(--space-2)', background: 'var(--glass-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              {allCourses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: 'var(--space-3)' }}>No published courses available. Create courses first.</p>
              ) : (
                allCourses.map(course => {
                  const selected = formData.course_ids.includes(course.id)
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => toggleCourse(course.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        background: selected ? 'var(--mint-light)' : 'transparent',
                        border: `1px solid ${selected ? 'var(--mint)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.88rem',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 'var(--radius-sm)',
                          border: `2px solid ${selected ? 'var(--mint)' : 'var(--border-strong)'}`,
                          background: selected ? 'var(--mint)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {selected && <Check size={12} color="white" />}
                      </div>
                      <span style={{ flex: 1 }}>{course.title}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        PKR {new Intl.NumberFormat('en-PK').format(course.price)}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}