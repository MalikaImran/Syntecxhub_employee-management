import './Navbar.css';

export default function Navbar({ view, setView, user, onLogout }) {
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="navbar">
      {/* BRAND */}
      <div className="brand">
        <div className="brand-logo">S</div>
        <span className="brand-name">StaffHub</span>
        <span className="brand-tag">v2.0</span>
      </div>

      {/* TABS — admin sees all, employee sees only profile */}
      <div className="nav-tabs">
        {isAdmin && (
          <>
            <button className={`nav-tab ${view==='dashboard'?'active':''}`} onClick={() => setView('dashboard')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              <span className="lbl">Dashboard</span>
            </button>
            <button className={`nav-tab ${view==='employees'?'active':''}`} onClick={() => setView('employees')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span className="lbl">Employees</span>
            </button>
          </>
        )}
        {!isAdmin && (
          <button className={`nav-tab ${view==='profile'?'active':''}`} onClick={() => setView('profile')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="lbl">My Profile</span>
          </button>
        )}
      </div>

      {/* RIGHT — user info + logout */}
      <div className="nav-right">
        <div className="nav-user">
          <div className="nav-avatar">{(user?.name||'U')[0]}</div>
          <div className="nav-user-info">
            <div className="nav-user-name">{user?.name}</div>
            <div className={`nav-role-badge ${isAdmin ? 'role-admin' : 'role-emp'}`}>
              {isAdmin ? '⚡ Admin' : '👤 Employee'}
            </div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className="lbl">Logout</span>
        </button>
      </div>
    </nav>
  );
}