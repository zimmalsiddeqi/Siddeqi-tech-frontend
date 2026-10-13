// ============================================
// ImageUpload Component — Image upload with preview & drag-and-drop
// Supports course banners (16:9) and profile avatars (circular/square)
// ============================================

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, Link2, Check } from 'lucide-react'
import { uploadApi } from '../services/api'
import { toast } from './Toast'

export default function ImageUpload({
  value = '',
  onChange,
  folder = 'general',
  shape = 'rectangle', // 'rectangle' | 'circle'
  aspectRatio = '16 / 9',
  label = 'Upload Image',
  helperText = 'JPG, PNG, WebP or GIF (max 5MB)',
  placeholder = 'Click or drag image here'
}) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const fileInputRef = useRef(null)

  const isCircle = shape === 'circle'

  async function handleFile(file) {
    if (!file) return

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP, GIF)')
      return
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB')
      return
    }

    setUploading(true)
    try {
      const res = await uploadApi.uploadImage(file, folder)
      const publicUrl = res.data?.url
      if (publicUrl) {
        onChange(publicUrl)
        toast.success('Image uploaded successfully!')
      } else {
        throw new Error('No URL returned from server')
      }
    } catch (err) {
      toast.error(err.message || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  function handleRemove(e) {
    e.stopPropagation()
    onChange('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleManualApply() {
    if (!manualUrl.trim()) return
    onChange(manualUrl.trim())
    setShowUrlInput(false)
    setManualUrl('')
  }

  // ==== CIRCLE AVATAR VARIANT ====
  if (isCircle) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {label && (
          <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          {/* Avatar circle with upload trigger */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              position: 'relative',
              width: 90,
              height: 90,
              borderRadius: 'var(--radius-full)',
              background: value ? 'transparent' : 'var(--gradient-cool)',
              border: dragActive ? '2px dashed var(--mint)' : '2px solid rgba(255,255,255,0.6)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploading ? 'wait' : 'pointer',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            title="Click to upload profile photo"
          >
            {value ? (
              <img
                src={value}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <ImageIcon size={32} style={{ color: 'white', opacity: 0.8 }} />
            )}

            {/* Hover / Uploading overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: uploading ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                opacity: uploading ? 1 : 0,
                transition: 'opacity 0.2s ease',
                borderRadius: 'var(--radius-full)'
              }}
              className={!uploading ? 'avatar-hover-overlay' : ''}
            >
              {uploading ? (
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Upload size={20} />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    {value ? 'Change Photo' : 'Upload Photo'}
                  </>
                )}
              </button>

              {value && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleRemove}
                  disabled={uploading}
                  style={{ color: 'var(--rose)' }}
                >
                  <X size={13} /> Remove
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              {helperText}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <style>{`
          .avatar-hover-overlay:hover {
            opacity: 1 !important;
          }
        `}</style>
      </div>
    )
  }

  // ==== RECTANGLE BANNER VARIANT ====
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && (
          <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => setShowUrlInput(prev => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--mint)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: 0
          }}
        >
          <Link2 size={12} />
          {showUrlInput ? 'Use file uploader' : 'Enter URL instead'}
        </button>
      </div>

      {showUrlInput ? (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input
            type="url"
            className="input"
            value={manualUrl || value}
            onChange={e => setManualUrl(e.target.value)}
            placeholder="https://example.com/banner.jpg"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleManualApply}
          >
            <Check size={14} /> Apply
          </button>
        </div>
      ) : (
        <>
          {value ? (
            /* Image Preview Card */
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                aspectRatio,
                border: '1px solid var(--border-subtle)',
                background: '#0F172A',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <img
                src={value}
                alt="Banner Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Action overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 50%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3)'
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'white',
                    fontFamily: 'var(--font-mono)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                  }}
                >
                  Banner image uploaded
                </span>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    className="btn btn-glass btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', color: 'white' }}
                  >
                    <Upload size={12} /> Replace
                  </button>
                  <button
                    type="button"
                    className="btn btn-glass btn-sm"
                    onClick={handleRemove}
                    disabled={uploading}
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', color: '#F87171' }}
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Dropzone */
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                borderRadius: 'var(--radius-lg)',
                border: dragActive
                  ? '2px dashed var(--mint)'
                  : '2px dashed var(--border-strong)',
                background: dragActive
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'var(--glass-bg-subtle)',
                aspectRatio,
                maxHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploading ? 'wait' : 'pointer',
                transition: 'all 0.2s ease',
                padding: 'var(--space-4)',
                textAlign: 'center'
              }}
            >
              {uploading ? (
                <>
                  <Loader2
                    size={32}
                    style={{ color: 'var(--mint)', animation: 'spin 1s linear infinite', marginBottom: 8 }}
                  />
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Uploading image...
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Uploading to secure storage
                  </span>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--mint-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--mint)',
                      marginBottom: 8
                    }}
                  >
                    <Upload size={20} />
                  </div>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {placeholder}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {helperText}
                  </span>
                </>
              )}
            </div>
          )}
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}
