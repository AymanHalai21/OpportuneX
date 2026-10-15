import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, AlertCircle, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { events } from '../data/events.js'
import CategoryImage from '../components/CategoryImage.jsx'
import './Login.css'

const PREVIEW_EVENTS = events.slice(0, 3)

export default function Login() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [college, setCollege] = useState('')
  const [email, setEmail] = useState('arjun@iitd.ac.in')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const { login, signup, showToast } = useAuth()
  const navigate = useNavigate()

  const handleTabSwitch = (newMode) => {
    setMode(newMode)
    setErrorMessage('')
    if (newMode === 'signup') {
      setName('')
      setCollege('')
      setEmail('')
      setPassword('')
    } else {
      setEmail('arjun@iitd.ac.in')
      setPassword('password123')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    // Basic Validation
    if (!email.trim()) {
      setErrorMessage('Please enter your student email.')
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address (e.g. student@college.edu).')
      return
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.')
        return
      }
      if (!college.trim()) {
        setErrorMessage('Please enter your college or university.')
        return
      }
      if (!agreeTerms) {
        setErrorMessage('Please agree to the Terms of Service & Privacy Policy.')
        return
      }

      try {
        await signup(name.trim(), email.trim(), password, college.trim())
        navigate('/discover')
      } catch (error) {
        setErrorMessage(error.message)
      }
      return
    }

    try {
      await login(email.trim(), password)
      navigate('/discover')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleGoogleAuth = () => {
    showToast('Google sign-in is not configured on this deployment. Use email and password.', 'info')
  }

  return (
    <div className="auth-page">
      {/* Left Column: Hero & Preview Panel */}
      <div className="auth-hero">
        <div className="auth-hero-glow" aria-hidden="true" />
        <div className="auth-hero-grid" aria-hidden="true" />

        <div className="auth-hero-content">
          <div className="auth-brand">
            <span className="auth-brand-logo">
              <Zap size={20} fill="currentColor" />
            </span>
            <span className="auth-brand-title">OpportuneX</span>
          </div>

          <h1 className="auth-headline">
            Where campus
            <br />
            life happens.
          </h1>
          <p className="auth-subhead">
            Discover hackathons, workshops, seminars, cultural fests, and competitions from top colleges across India.
          </p>

          <div className="auth-preview-list">
            <span className="auth-preview-title">Live Campus Opportunities</span>
            {PREVIEW_EVENTS.map((ev) => (
              <div key={ev.id} className="auth-preview-card">
                <div className="auth-preview-thumb">
                  <CategoryImage category={ev.category} image={ev.banner || ev.image} title={ev.title} className="auth-thumb-img" />
                </div>
                <div className="auth-preview-text">
                  <strong>{ev.title}</strong>
                  <span>{ev.dateLabel} · {ev.venue}</span>
                </div>
                <span className="pill category-pill" data-category={ev.category}>
                  {ev.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          {/* Mobile-only brand badge */}
          <div className="auth-mobile-brand">
            <span className="auth-mobile-logo">
              <Zap size={18} fill="currentColor" />
            </span>
            <span className="auth-mobile-name">OpportuneX</span>
          </div>

          <div className="auth-form-header">
            <h2 className="auth-title">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="auth-caption">
              {mode === 'login'
                ? 'Sign in to access your campus events and tickets'
                : 'Join thousands of students exploring campus opportunities'}
            </p>
          </div>

          {/* Segmented Mode Tabs */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tab${mode === 'login' ? ' active' : ''}`}
              onClick={() => handleTabSwitch('login')}
            >
              Log In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={`auth-tab${mode === 'signup' ? ' active' : ''}`}
              onClick={() => handleTabSwitch('signup')}
            >
              Sign Up
            </button>
          </div>

          {/* Validation Alert */}
          {errorMessage && (
            <div className="auth-error-alert" role="alert">
              <AlertCircle size={16} className="auth-error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {mode === 'signup' && (
              <>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    className="auth-input"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errorMessage) setErrorMessage('')
                    }}
                    placeholder="e.g. Arjun Sharma"
                    autoComplete="name"
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="college">
                    College / University
                  </label>
                  <input
                    id="college"
                    className="auth-input"
                    type="text"
                    value={college}
                    onChange={(e) => {
                      setCollege(e.target.value)
                      if (errorMessage) setErrorMessage('')
                    }}
                    placeholder="e.g. IIT Delhi"
                    autoComplete="organization"
                  />
                </div>
              </>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Student Email
              </label>
              <input
                id="email"
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errorMessage) setErrorMessage('')
                }}
                placeholder="e.g. arjun@iitd.ac.in"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-field-header">
                <label className="auth-label" htmlFor="password">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => {
                      alert('Password reset link sent to your registered email.')
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="auth-password-wrapper">
                <input
                  id="password"
                  className="auth-input auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'login' ? (
              <div className="auth-remember-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="auth-checkbox"
                  />
                  <span>Remember me for 30 days</span>
                </label>
              </div>
            ) : (
              <div className="auth-terms-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="auth-checkbox"
                  />
                  <span>
                    I agree to the <span className="auth-link-text">Terms of Service</span> & <span className="auth-link-text">Privacy Policy</span>
                  </span>
                </label>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg auth-submit">
              <span>{mode === 'login' ? 'Log In' : 'Create Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-block btn-lg auth-google"
            onClick={handleGoogleAuth}
          >
            <svg className="auth-google-svg" viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Bottom Switcher */}
          <div className="auth-footer-nav">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => handleTabSwitch('signup')}
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => handleTabSwitch('login')}
                >
                  Log In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

