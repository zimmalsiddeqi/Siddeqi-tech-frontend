import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Save, Loader2,
  Shield, Calendar, CheckCircle2, Key, Server
} from 'lucide-react'
import { adminApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/Toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import ImageUpload from '../../components/ImageUpload'

export default function AdminProfile() {
  const { profile, user, refreshProfile } = useAuth()
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
      await adminApi.updateProfile({
        full_name: formData.full_name.trim(),
        whatsapp: formData.whatsapp.trim() || null,
        avatar_url: formData.avatar_url.trim() || null
      })
      await refreshProfile()
      toast.success('Admin profile updated successfully!')
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
    <div style={{ maxWidth: 760, animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)' }}>
          Admin <span className="gradient-text">Profile</span>
        </h1>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Manage your administrator profile, personal information, and display avatar
        </p>
      </div>

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
        {/* Avatar Display */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
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
              alt="Admin Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            profile.full_name?.charAt(0)?.toUpperCase() || 'A'
          )}
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
              {profile.full_name || 'System Administrator'}
            </h2>
            <span className="badge badge-mint" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Shield size={11} /> Admin
            </span>
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: 'var(--space-3)' }}>
            {profile.email || user?.email}
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={13} /> Joined {joinDate}
            </span>
            {profile.is_active && (
              <span style={{ fontSize: '0.82rem', color: 'var(--mint)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> Active Admin Account
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSave}>
        <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 'var(--space-6)' }}>
            Account Details & Avatar
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Full Name */}
            <div className="input-group">
              <label>
                <User size={14} style={{ display: 'inline', marginRight: 6 }} />
                Full Name
              </label>
              <div className="input-wrapper">
                <User size={18} className="input-icon-left" />
                <input
                  type="text"
                  className="input"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Administrator Name"
                  style={{ paddingLeft: 44 }}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>
            </div>

            {/* Email Address (Read Only) */}
            <div className="input-group">
              <label>
                <Mail size={14} style={{ display: 'inline', marginRight: 6 }} />
                Admin Email Address
              </label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon-left" />
                <input
                  type="email"
                  className="input"
                  value={profile.email || user?.email || ''}
                  disabled
                  style={{ paddingLeft: 44, opacity: 0.65, cursor: 'not-allowed' }}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                System administrator login email cannot be changed directly.
              </p>
            </div>

            {/* WhatsApp */}
            <div className="input-group">
              <label>
                <Phone size={14} style={{ display: 'inline', marginRight: 6 }} />
                WhatsApp / Contact Number
              </label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon-left" />
                <input
                  type="tel"
                  className="input"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="+923XXXXXXXXX"
                  style={{ paddingLeft: 44 }}
                  minLength={10}
                  maxLength={20}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Contact number displayed for student support and operational communications.
              </p>
            </div>

            {/* Avatar Image Upload */}
            <ImageUpload
              value={formData.avatar_url}
              onChange={(url) => handleChange('avatar_url', url)}
              folder="avatars"
              shape="circle"
              label="Admin Profile Avatar"
              helperText="Upload a professional profile photo or avatar (JPG, PNG, WebP up to 5MB)"
            />
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving Changes...
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

      {/* Admin Privileges Info Card */}
      <div className="glass-card" style={{ padding: 'var(--space-8)', marginTop: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={18} color="var(--mint)" /> System Permissions & Security
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)'
          }}
        >
          {[
            { label: 'Role Type', value: 'System Administrator' },
            { label: 'Live Broadcast', value: 'LiveKit Room Host & Recorder' },
            { label: 'Access Tier', value: 'Full Administrative Privileges' },
            { label: 'User ID', value: profile.id?.slice(0, 8) + '...' }
          ].map((item) => (
            <div key={item.label} style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.35)' }}>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                {item.label}
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
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
