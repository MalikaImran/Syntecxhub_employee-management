import { useState } from 'react';
import './Login.css';

// Users stored in localStorage — signup se naye users add hote hain
const ADMIN = { email: 'ahmedj@gmail.com', password: 'ahmed@123', role: 'admin', name: 'Ahmed' };

function getUsers() {
  const saved = localStorage.getItem('staffhub_users');
  const users = saved ? JSON.parse(saved) : [];
  // Admin hamesha rehta hai
  if (!users.find(u => u.email === ADMIN.email)) {
    users.unshift(ADMIN);
    localStorage.setItem('staffhub_users', JSON.stringify(users));
  }
  return users;
}

function saveUser(newUser) {
  const users = getUsers();
  users.push(newUser);
  localStorage.setItem('staffhub_users', JSON.stringify(users));
}

export default function Login({ onLogin }) {
  const [mode, setMode]           = useState('login'); // 'login' | 'signup'
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

  // LOGIN
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('please Fill Email and password '); return; }

    setLoading(true);
    setTimeout(() => {
      const users = getUsers();
      const user  = users.find(u => u.email === email.trim().toLowerCase() && u.password === password);
      if (user) {
        localStorage.setItem('staffhub_user', JSON.stringify(user));
        onLogin(user);
      } else {
        setError('Email or password Incorrect! ');
      }
      setLoading(false);
    }, 700);
  };

  // SIGNUP
  const handleSignup = (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!name.trim())     { setError('Please fill in the Name'); return; }
    if (!email.trim())    { setError('Please fill in the email.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Valid email likho!'); return; }
    if (password.length < 6) { setError('Password '); return; }
    if (password !== confirmPass) { setError('Both passwords do not match.'); return; }

    const users = getUsers();
    if (users.find(u => u.email === email.trim().toLowerCase())) {
      setError('Your email is already registered '); return;
    }

    setLoading(true);
    setTimeout(() => {
      const newUser = { name: name.trim(), email: email.trim().toLowerCase(), password, role: 'employee' };
      saveUser(newUser);
      setSuccess('Account Created! Lets Go 🎉');
      setLoading(false);
      setTimeout(() => switchMode('login'), 1500);
    }, 700);
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
          <button className={`auth-tab ${mode==='login'?'auth-active':''}`} onClick={() => switchMode('login')}>Login</button>
          <button className={`auth-tab ${mode==='signup'?'auth-active':''}`} onClick={() => switchMode('signup')}>Sign Up</button>
        </div>

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <>
            <h2 className="login-title">Welcome Back 👋</h2>
            <p className="login-desc">Login Account</p>

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

              {error   && <div className="login-error">⚠️ {error}</div>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <><span className="btn-spinner"/> &nbsp;Logging in...</> : '🚀 Login'}
              </button>
            </form>

            <p className="switch-txt">Do you already have an account?<button className="switch-link" onClick={() => switchMode('signup')}>Sign Up </button></p>
          </>
        )}

        {/* ── SIGNUP FORM ── */}
        {mode === 'signup' && (
          <>
            <h2 className="login-title">Create Account ✨</h2>
            <p className="login-desc">Lets Get Started</p>

            <form onSubmit={handleSignup} className="login-form" noValidate>
              <div className="inp-group">
                <label>Full Name</label>
                <div className="inp-wrap">
                  <span className="inp-icon">👤</span>
                  <input type="text" placeholder="Full Name" value={name}
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
                  <input type={showPass?'text':'password'} placeholder=" Confirm Password " value={confirmPass}
                    onChange={e => { setConfirm(e.target.value); setError(''); }} disabled={loading}/>
                </div>
              </div>

              {error   && <div className="login-error">⚠️ {error}</div>}
              {success && <div className="login-success">✅ {success}</div>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <><span className="btn-spinner"/> &nbsp;Creating...</> : '🎉 Create Account'}
              </button>
            </form>

            <p className="switch-txt">Do you already have an account? <button className="switch-link" onClick={() => switchMode('login')}>Login </button></p>
          </>
        )}
      </div>
    </div>
  );
}