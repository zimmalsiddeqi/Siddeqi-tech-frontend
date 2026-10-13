import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Camera, Save, Loader2,
  Shield, Calendar, CheckCircle2
} from 'lucide-react'
import { studentApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/Toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import ImageUpload from '../../components/ImageUpload'

export default function StudentProfile() {
  const { profile, user, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    whatsapp: '',
    avatar_url: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        whatsapp: profile.whatsapp || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await studentApi.updateProfile({
        full_name: formData.full_name.trim(),
        whatsapp: formData.whatsapp.trim() || null,
        avatar_url: formData.avatar_url.trim() || null
      })
      await refreshProfile()
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return <LoadingSpinner />

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div style={{ maxWidth: 720, animation: 'fadeIn 0.4s ease-out' }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)' }}>
        My <span className="gradient-text">Profile</span>
      </h1>
      <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-8)' }}>
        Manage your account information and preferences
      </p>

      {/* Profile Header Card */}
      <div
        className="glass-card-strong"
        style={{
          padding: 'var(--space-8)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-6)',
          flexWrap: 'wrap'
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'white',
            fontFamily: 'var(--font-display)',
            flexShrink: 0,
            boxShadow: 'var(--shadow-glow-mint)',
            overflow: 'hidden'
          }}
        >
          {formData.avatar_url ? (
            <img
              src={formData.avatar_url}
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            profile.full_name?.charAt(0)?.toUpperCase() || 'S'
          )}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>
            {profile.full_name || 'Student'}
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-mint">
              <Shield size={10} /> {profile.role}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={13} /> Joined {joinDate}
            </span>
            {profile.is_active && (
              <span style={{ fontSize: '0.82rem', color: 'var(--mint)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave}>
        <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-6)' }}>
            Personal Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Full Name */}
            <div className="input-group">
              <label>
                <User size={14} style={{ display: 'inline', marginRight: 6 }} />
                Full Name
              </label>
              <input
                type="text"
                className="input"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Your full name"
                minLength={2}
                maxLength={100}
              />
            </div>

            {/* Email (Read Only) */}
            <div className="input-group">
              <label>
                <Mail size={14} style={{ display: 'inline', marginRight: 6 }} />
                Email Address
              </label>
              <input
                type="email"
                className="input"
                value={profile.email || user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            {/* WhatsApp */}
            <div className="input-group">
              <label>
                <Phone size={14} style={{ display: 'inline', marginRight: 6 }} />
                WhatsApp Number
              </label>
              <input
                type="tel"
                className="input"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="+923XXXXXXXXX"
                minLength={10}
                maxLength={20}
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Used for course updates and payment verification
              </p>
            </div>

            {/* Profile Avatar Upload */}
            <ImageUpload
              value={formData.avatar_url}
              onChange={(url) => handleChange('avatar_url', url)}
              folder="avatars"
              shape="circle"
              label="Profile Photo / Avatar"
              helperText="Click the circle or button to upload a photo (JPG, PNG, WebP up to 5MB)"
            />
          </div>

          {/* Save Button */}
          <div style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Account Info */}
      <div className="glass-card" style={{ padding: 'var(--space-8)', marginTop: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)' }}>
          Account Details
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)'
          }}
        >
          {[
            { label: 'User ID', value: profile.id?.slice(0, 8) + '...' },
            { label: 'Role', value: profile.role },
            { label: 'Status', value: profile.is_active ? 'Active' : 'Inactive' },
            { label: 'Joined', value: joinDate }
          ].map((item) => (
            <div key={item.label}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                {item.label}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}