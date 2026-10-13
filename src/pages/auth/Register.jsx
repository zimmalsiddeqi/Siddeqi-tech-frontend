import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft,
  Sparkles, Loader2, CheckCircle2, AlertCircle, ShieldCheck,
  Check, Phone, CheckCircle, RefreshCw
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/Toast'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  // Stepper state: 1 = Account, 2 = Security, 3 = Review, 'confirmed' = Success Email Screen
  const [step, setStep] = useState(1)

  // Form Fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(true)

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: 'transparent' }
    if (pwd.length < 6) return { level: 1, label: 'Weak', color: '#F43F5E' }

    let score = 0
    if (pwd.length >= 8) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++

    if (score <= 1) {
      return { level: 1, label: 'Weak', color: '#F43F5E' }
    } else if (score === 2 || score === 3) {
      return { level: 2, label: 'Intermediate', color: '#F59E0B' }
    } else {
      return { level: 3, label: 'Strong', color: '#10B981' }
    }
  }

  const strength = getPasswordStrength(password)
  const isMatch = confirmPassword.length > 0 && password === confirmPassword
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword

  // Navigation between steps with validation
  const goToStep2 = (e) => {
    e?.preventDefault()
    if (!fullName.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }
    setStep(2)
  }

  const goToStep3 = (e) => {
    e?.preventDefault()
    if (!password) {
      toast.error('Please enter a password')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setStep(3)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()

    if (!agreeTerms) {
      toast.error('Please accept the terms to proceed')
      return
    }

    setLoading(true)
    try {
      await signUp(email.trim(), password, fullName.trim())
      toast.success('Account created successfully!')
      setStep('confirmed')
    } catch (err) {
      const msg = err.message || 'Registration failed'
      if (msg.includes('already registered')) {
        toast.error('This email is already registered. Try logging in.')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      style={{
        minHeight: 'calc(100vh - var(--navbar-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8) var(--space-4)'
      }}
    >
      <div
        className="glass-card-strong"
        style={{
          width: '100%',
          maxWidth: step === 'confirmed' ? 520 : 480,
          padding: 'var(--space-10) var(--space-8)',
          animation: 'fadeInUp 0.5s var(--ease-smooth)',
          position: 'relative'
        }}
      >
        {/* =========================================================
            STATE: EMAIL CONFIRMATION TEMPLATE (MODERN LUXURY SCREEN)
            ========================================================= */}
        {step === 'confirmed' ? (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Animated Glow Envelope Icon */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(251, 146, 60, 0.15))',
                border: '1.5px solid rgba(16, 185, 129, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-6)',
                boxShadow: 'var(--shadow-glow-mint)',
                position: 'relative'
              }}
            >
              <Mail size={36} color="var(--mint)" />
              <div
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--mint)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Check size={14} strokeWidth={3} />
              </div>
            </div>

            <h2 style={{ fontSize: '1.85rem', marginBottom: 'var(--space-2)' }}>
              Check Your <span className="gradient-text">Inbox</span>
            </h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem', marginBottom: 'var(--space-5)' }}>
              We have sent an account verification email to:
            </p>

            {/* Email Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: 'var(--mint-dark, #059669)',
                fontWeight: 600,
                fontSize: '0.95rem',
                marginBottom: 'var(--space-6)',
                wordBreak: 'break-all'
              }}
            >
              <Mail size={16} />
              <span>{email}</span>
            </div>

            {/* Step-by-step instructions card */}
            <div
              className="glass-card"
              style={{
                textAlign: 'left',
                padding: 'var(--space-5) var(--space-6)',
                marginBottom: 'var(--space-6)',
                background: 'rgba(255, 255, 255, 0.45)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
                Next Simple Steps:
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--mint)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>1</span>
                  <span>Open your email app and find the confirmation message from <strong>Shawkat Tech</strong>.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--mint)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>2</span>
                  <span>Click the <strong>Confirm your email</strong> link inside to activate your student account.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--mint)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>3</span>
                  <span>Return and sign in to explore your courses and enrolled live classes.</span>
                </li>
              </ul>
            </div>

            {/* Spam notice */}
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
              Didn't see the email? Be sure to check your <strong>Spam or Promotions</strong> folder.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Link
                to="/login"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Proceed to Sign In
                <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', color: 'var(--text-tertiary)' }}
              >
                Need to change email or details?
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================
              3-STEP REGISTRATION FORM
              ========================================================= */
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--gradient-peach)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-3)',
                  boxShadow: 'var(--shadow-glow-peach)'
                }}
              >
                <Sparkles size={26} color="white" />
              </div>
              <h2 style={{ marginBottom: 'var(--space-1)' }}>Create Account</h2>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                {step === 1 && 'Step 1 of 3: Personal Information'}
                {step === 2 && 'Step 2 of 3: Security & Credentials'}
                {step === 3 && 'Step 3 of 3: Review & Finalize'}
              </p>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', padding: '0 4px' }}>
              {[
                { num: 1, label: 'Profile' },
                { num: 2, label: 'Security' },
                { num: 3, label: 'Review' }
              ].map((s, idx) => {
                const isActive = step === s.num
                const isPassed = step > s.num
                return (
                  <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: idx < 2 ? 1 : 'none' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          transition: 'all 0.3s ease',
                          background: isPassed
                            ? 'var(--mint)'
                            : isActive
                            ? 'var(--gradient-peach)'
                            : 'rgba(148, 163, 184, 0.2)',
                          color: isPassed || isActive ? 'white' : 'var(--text-muted)',
                          boxShadow: isActive ? 'var(--shadow-glow-peach)' : 'none'
                        }}
                      >
                        {isPassed ? <Check size={16} strokeWidth={3} /> : s.num}
                      </div>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
                        }}
                      >
                        {s.label}
                      </span>
                    </div>

                    {idx < 2 && (
                      <div
                        style={{
                          flex: 1,
                          height: 2,
                          margin: '0 8px 18px',
                          background: step > s.num ? 'var(--mint)' : 'rgba(148, 163, 184, 0.2)',
                          transition: 'background 0.3s ease'
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* STEP 1: Basic Information */}
            {step === 1 && (
              <form onSubmit={goToStep2} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div className="input-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon-left" />
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Ahmad Khan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ paddingLeft: 44 }}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon-left" />
                    <input
                      type="email"
                      className="input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: 44 }}
                      required
                    />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    We will send a verification link to this address.
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: 'var(--space-2)' }}
                >
                  Continue to Security
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* STEP 2: Password & Confirm Password */}
            {step === 2 && (
              <form onSubmit={goToStep3} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {/* Password Input */}
                <div className="input-group">
                  <label>Create Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon-left" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: 44, paddingRight: 44 }}
                      autoFocus
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="input-icon-right"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Meter (Weak / Intermediate / Strong) */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 6, animation: 'fadeIn 0.2s ease-out' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          Password Strength:
                        </span>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: strength.color
                          }}
                        >
                          {strength.label}
                        </span>
                      </div>

                      {/* 3-segment Visual Bar */}
                      <div style={{ display: 'flex', gap: 4, height: 5 }}>
                        {[1, 2, 3].map((barIndex) => (
                          <div
                            key={barIndex}
                            style={{
                              flex: 1,
                              borderRadius: 4,
                              background:
                                barIndex <= strength.level
                                  ? strength.color
                                  : 'rgba(148, 163, 184, 0.2)',
                              transition: 'background 0.3s ease'
                            }}
                          />
                        ))}
                      </div>

                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        {strength.level === 1 && 'Use at least 8 characters with letters and numbers'}
                        {strength.level === 2 && 'Good! Add symbols & capital letters for extra strength'}
                        {strength.level === 3 && 'Excellent! High-security password'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="input-group">
                  <label>Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon-left" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        paddingLeft: 44,
                        paddingRight: 44,
                        borderColor: isMatch
                          ? 'var(--mint)'
                          : isMismatch
                          ? 'var(--rose)'
                          : undefined
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="input-icon-right"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Confirm Password Indication */}
                  {isMatch && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: '0.8rem', marginTop: 4 }}>
                      <CheckCircle2 size={15} />
                      <span>Passwords match</span>
                    </div>
                  )}
                  {isMismatch && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F43F5E', fontSize: '0.8rem', marginTop: 4 }}>
                      <AlertCircle size={15} />
                      <span>Passwords do not match</span>
                    </div>
                  )}
                </div>

                {/* Back & Next Buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    disabled={!password || password.length < 6 || password !== confirmPassword}
                  >
                    Review Details
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Review & Final Confirmation */}
            {step === 3 && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {/* Summary Card */}
                <div
                  className="glass-card"
                  style={{
                    padding: 'var(--space-5)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    background: 'rgba(255, 255, 255, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)' }}>Full Name</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{fullName}</span>
                  </div>
                  <div style={{ height: 1, background: 'rgba(148, 163, 184, 0.15)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)' }}>Email Address</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{email}</span>
                  </div>
                  <div style={{ height: 1, background: 'rgba(148, 163, 184, 0.15)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-tertiary)' }}>Password Security</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: strength.color === '#10B981' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: strength.color
                      }}
                    >
                      {strength.label} Protected
                    </span>
                  </div>
                </div>

                {/* Optional WhatsApp for alerts */}
                <div className="input-group">
                  <label>WhatsApp Number (Optional)</label>
                  <div className="input-wrapper">
                    <Phone size={18} className="input-icon-left" />
                    <input
                      type="tel"
                      className="input"
                      placeholder="+92 3XX XXXXXXX"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      style={{ paddingLeft: 44 }}
                    />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    For receiving instant class links & payment updates.
                  </p>
                </div>

                {/* Agreement Checkbox */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--mint)' }}
                  />
                  <span>
                    I agree to the terms of service, privacy guidelines, and student portal policies.
                  </span>
                </label>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    disabled={loading}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    disabled={loading || !agreeTerms}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Footer */}
            <p
              style={{
                textAlign: 'center',
                marginTop: 'var(--space-6)',
                fontSize: '0.9rem',
                color: 'var(--text-tertiary)'
              }}
            >
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--mint)', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  )
}