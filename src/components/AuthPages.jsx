import React, { useState } from 'react';
import './AuthPages.css';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from '../firebase';

// ── Icon Components ──
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4L12 13 2 4" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/** Map Firebase error codes to user-friendly messages */
function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// ══════════════════════════════════
// LOGIN PAGE
// ══════════════════════════════════
export function LoginPage({ onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.jsx handles the rest
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = email.trim() && password.trim() && !loading;

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" /></svg>
          </div>
          <div className="auth-brand-text">Kinetic<span>Lab</span></div>
        </div>

        {/* Card */}
        <div className="auth-card">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to continue tracking your progress</p>

          <form className="auth-form" onSubmit={handleLogin}>
            {error && (
              <div className="auth-error">
                <span className="auth-error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                />
                <span className="auth-input-icon"><MailIcon /></span>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <span className="auth-input-icon"><LockIcon /></span>
                <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={!canSubmit}>
              {loading ? <div className="auth-spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <button className="auth-switch-link" onClick={onSwitchToSignup}>
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════
// SIGNUP PAGE
// ══════════════════════════════════
export function SignupPage({ onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Set displayName on the Firebase user
      await updateProfile(cred.user, { displayName: name });
      // onAuthStateChanged in App.jsx handles the redirect to onboarding
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = name.trim() && email.trim() && password.trim() && !loading;

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" /></svg>
          </div>
          <div className="auth-brand-text">Kinetic<span>Lab</span></div>
        </div>

        {/* Card */}
        <div className="auth-card">
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Start your fitness journey with Kinetic Lab</p>

          <form className="auth-form" onSubmit={handleSignup}>
            {error && (
              <div className="auth-error">
                <span className="auth-error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  autoComplete="name"
                />
                <span className="auth-input-icon"><UserIcon /></span>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <span className="auth-input-icon"><MailIcon /></span>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <span className="auth-input-icon"><LockIcon /></span>
                <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={!canSubmit}>
              {loading ? <div className="auth-spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <button className="auth-switch-link" onClick={onSwitchToLogin}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
