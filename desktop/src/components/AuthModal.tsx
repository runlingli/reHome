import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { Logo, Icon, T, ACCENT } from './ui'
import { auth as apiAuth, setTokens, ApiError } from '../api'

const SCHOOL_MAP: Record<string, string> = {
  'mit.edu': 'MIT',
  'harvard.edu': 'Harvard University',
  'bu.edu': 'Boston University',
  'northeastern.edu': 'Northeastern University',
  'bc.edu': 'Boston College',
  'tufts.edu': 'Tufts University',
  'brandeis.edu': 'Brandeis University',
  'wellesley.edu': 'Wellesley College',
  'emerson.edu': 'Emerson College',
  'suffolk.edu': 'Suffolk University',
}

function schoolFromEmail(email: string): string {
  const domain = email.split('@')[1] || ''
  if (SCHOOL_MAP[domain]) return SCHOOL_MAP[domain]
  const base = domain.replace('.edu', '')
  return base.charAt(0).toUpperCase() + base.slice(1)
}

function friendlyError(e: unknown): string {
  if (e instanceof ApiError) {
    const map: Record<string, string> = {
      INVALID_EDU_EMAIL: 'This email domain is not recognised as a university .edu address.',
      EMAIL_TAKEN:       'An account with this email already exists. Try logging in.',
      WRONG_PASSWORD:    'Incorrect password. Please try again.',
      TOKEN_EXPIRED:     'Your session expired. Please log in again.',
    }
    return map[e.code] ?? e.message
  }
  if (e instanceof TypeError) {
    // Network / CORS error (backend not live yet)
    return 'Could not reach the server. Please try again later.'
  }
  return 'Something went wrong. Please try again.'
}

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '12px 14px',
  borderRadius: 10, border: '1px solid ' + T.border,
  fontSize: 14, color: T.text, background: T.bg,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: T.textMuted,
  letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6,
  fontFamily: '"JetBrains Mono", monospace',
}

export function AuthModal() {
  const { authOpen, authMode, closeAuth, signIn } = useStore()
  const [tab, setTab] = useState<'login' | 'signup'>(authMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { setTab(authMode); setError('') }, [authMode])
  useEffect(() => {
    if (!authOpen) { setName(''); setEmail(''); setPassword(''); setError(''); setLoading(false) }
  }, [authOpen])

  if (!authOpen) return null

  const clearError = () => setError('')

  const handleSignup = async () => {
    if (!name.trim())                      { setError('Please enter your full name.'); return }
    if (!email.toLowerCase().endsWith('.edu')) { setError('reHome requires a university .edu email to sign up.'); return }
    if (password.length < 6)               { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      const res = await apiAuth.register({
        name: name.trim(),
        email: email.toLowerCase(),
        password,
        school: schoolFromEmail(email.toLowerCase()),
      })
      setTokens(res.access_token, res.refresh_token)
      signIn({
        id:             res.user.id,
        email:          res.user.email,
        name:           res.user.name,
        school:         res.user.school,
        handle:         res.user.handle,
        eduVerified:    res.user.edu_verified,
        localVerified:  res.user.local_verified,
        avatarInitials: res.user.avatar_initials,
        avatarColor:    res.user.avatar_color,
      })
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (!password)            { setError('Please enter your password.'); return }

    setLoading(true)
    try {
      const res = await apiAuth.login({ email: email.toLowerCase(), password })
      setTokens(res.access_token, res.refresh_token)
      signIn({
        id:             res.user.id,
        email:          res.user.email,
        name:           res.user.name,
        school:         res.user.school,
        handle:         res.user.handle,
        eduVerified:    res.user.edu_verified,
        localVerified:  res.user.local_verified,
        avatarInitials: res.user.avatar_initials,
        avatarColor:    res.user.avatar_color,
      })
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={closeAuth}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, background: T.bg, borderRadius: 22, padding: 32, position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
      >
        {/* Close */}
        <button
          onClick={closeAuth}
          style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 999, border: '0.75px solid ' + T.border, background: T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="close" size={14} color={T.textMuted} />
        </button>

        {/* Logo */}
        <div style={{ marginBottom: 24 }}><Logo size={20} /></div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: T.surfaceAlt, borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {(['login', 'signup'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); clearError() }}
              style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: tab === t ? T.bg : 'transparent',
                color: tab === t ? T.text : T.textMuted,
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tab === 'signup' && (
            <div>
              <label style={labelStyle}>Full name</label>
              <input style={inputStyle} placeholder="Your name" value={name} onChange={e => { setName(e.target.value); clearError() }} />
            </div>
          )}

          <div>
            <label style={labelStyle}>{tab === 'signup' ? 'University .edu email' : 'Email'}</label>
            <input
              style={inputStyle}
              placeholder="you@university.edu"
              value={email}
              onChange={e => { setEmail(e.target.value); clearError() }}
              type="email"
            />
            {tab === 'signup' && (
              <div style={{ fontSize: 11, color: T.textFaint, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="shield" size={11} color={ACCENT} />
                A .edu email is required to list items as a verified student.
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputStyle, paddingRight: 44 }}
                type={showPw ? 'text' : 'password'}
                placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'}
                value={password}
                onChange={e => { setPassword(e.target.value); clearError() }}
                onKeyDown={e => { if (e.key === 'Enter') tab === 'signup' ? handleSignup() : handleLogin() }}
              />
              <button
                onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, fontSize: 11, fontWeight: 600 }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#C0392B', background: '#FDF0EE', border: '1px solid #F5C6C0', borderRadius: 8, padding: '9px 12px', lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <button
            onClick={tab === 'signup' ? handleSignup : handleLogin}
            disabled={loading}
            style={{ width: '100%', marginTop: 4, padding: '13px', background: loading ? T.border : ACCENT, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 0.1, transition: 'background 0.15s' }}
          >
            {loading ? 'Please wait…' : tab === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </div>

        {/* Footer switch */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: T.textMuted }}>
          {tab === 'signup' ? (
            <>Already have an account?{' '}
              <button onClick={() => { setTab('login'); clearError() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontWeight: 600, fontSize: 12, padding: 0 }}>Log in</button>
            </>
          ) : (
            <>New to reHome?{' '}
              <button onClick={() => { setTab('signup'); clearError() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontWeight: 600, fontSize: 12, padding: 0 }}>Sign up</button>
            </>
          )}
        </div>

        {tab === 'signup' && (
          <div style={{ marginTop: 16, fontSize: 11, color: T.textFaint, textAlign: 'center', lineHeight: 1.6 }}>
            By signing up you agree to our Terms and Privacy Policy.
          </div>
        )}
      </div>
    </div>
  )
}
