import { useState } from 'react';
import './Login.css';

const API = 'http://localhost:5000/api/auth';

export default function Login({ onLogin }) {
  const [mode, setMode]           = useState('login');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPass, setConfirm] = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const reset = () => { setName(''); setEmail(''); setPassword(''); setConfirm(''); setError(''); setSuccess(''); };
  const switchMode = (m) => { setMode(m); reset(); };

  // ── LOGIN — calls real backend ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required!'); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (data.success) {
        // Save JWT token + user info
        localStorage.setItem('staffhub_token', data.token);
        localStorage.setItem('staffhub_user',  JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running!');
    }
    setLoading(false);
  };

  // ── SIGNUP — calls real backend ──
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!name.trim())              { setError('Name is required!'); return; }
    if (!email.trim())             { setError('Email is required!'); return; }
    if (password.length < 6)       { setError('Password must be at least 6 characters!'); return; }
    if (password !== confirmPass)  { setError('Passwords do not match!'); return; }

    setLoading(true);
    try {
      const res  = await fetch(`${API}/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Account created successfully! Please login now 🎉');
        setTimeout(() => switchMode('login'), 1500);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch {
      setError('Cannot connect to server. Make sure backend is running!');
    }
    setLoading(false);
  };

  return (
    <div className="login-bg">
      <div className="blob blob-1"/><div className="blob blob-2"/><div className="blob blob-3"/>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">S</div>
          <div>
            <div className="logo-name">StaffHub</div>
            <div className="logo-sub">Employee Management System</div>
          </div>
        </div>

        <div className="login-divider"/>

        {/* Toggle tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${mode==='login'?'auth-active':''}`}  onClick={() => switchMode('login')}>Login</button>
          <button className={`auth-tab ${mode==='signup'?'auth-active':''}`} onClick={() => switchMode('signup')}>Sign Up</button>
        </div>

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <>
            <h2 className="login-title">Welcome Back 👋</h2>
            <p className="login-desc">Login to your account</p>

            <form onSubmit={handleLogin} className="login-form" noValidate>
              <div className="inp-group">
                <label>Email Address</label>
                <div className="inp-wrap">
                  <span className="inp-icon">📧</span>
                  <input type="email" placeholder="yourname@gmail.com" value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }} disabled={loading} autoComplete="email"/>
                </div>
              </div>
              <div className="inp-group">
                <label>Password</label>
                <div className="inp-wrap">
                  <span className="inp-icon">🔒</span>
                  <input type={showPass?'text':'password'} placeholder="••••••••" value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }} disabled={loading}/>
                  <button type="button" className="show-pass" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              {error && <div className="login-error">⚠️ {error}</div>}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <><span className="btn-spinner"/> &nbsp;Logging in...</> : '🚀 Login'}
              </button>
            </form>
            <p className="switch-txt">No account? <button className="switch-link" onClick={() => switchMode('signup')}>Sign Up</button></p>
          </>
        )}

        {/* ── SIGNUP FORM ── */}
        {mode === 'signup' && (
          <>
            <h2 className="login-title">Create Account ✨</h2>
            <p className="login-desc">Join StaffHub today</p>

            <form onSubmit={handleSignup} className="login-form" noValidate>
              <div className="inp-group">
                <label>Full Name</label>
                <div className="inp-wrap">
                  <span className="inp-icon">👤</span>
                  <input type="text" placeholder="Your full name" value={name}
                    onChange={e => { setName(e.target.value); setError(''); }} disabled={loading}/>
                </div>
              </div>
              <div className="inp-group">
                <label>Email Address</label>
                <div className="inp-wrap">
                  <span className="inp-icon">📧</span>
                  <input type="email" placeholder="yourname@gmail.com" value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }} disabled={loading}/>
                </div>
              </div>
              <div className="inp-group">
                <label>Password</label>
                <div className="inp-wrap">
                  <span className="inp-icon">🔒</span>
                  <input type={showPass?'text':'password'} placeholder="Min 6 characters" value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }} disabled={loading}/>
                  <button type="button" className="show-pass" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="inp-group">
                <label>Confirm Password</label>
                <div className="inp-wrap">
                  <span className="inp-icon">🔑</span>
                  <input type={showPass?'text':'password'} placeholder="Re-enter password" value={confirmPass}
                    onChange={e => { setConfirm(e.target.value); setError(''); }} disabled={loading}/>
                </div>
              </div>
              {error   && <div className="login-error">⚠️ {error}</div>}
              {success && <div className="login-success">✅ {success}</div>}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <><span className="btn-spinner"/> &nbsp;Creating...</> : '🎉 Create Account'}
              </button>
            </form>
            <p className="switch-txt">Already have an account? <button className="switch-link" onClick={() => switchMode('login')}>Login</button></p>
          </>
        )}
      </div>
    </div>
  );
}