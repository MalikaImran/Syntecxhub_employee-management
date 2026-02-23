import './EmployeeList.css';

const DEPARTMENTS = [
  'All',
  'Engineering', 'Design', 'Marketing', 'Sales',
  'HR', 'Finance', 'Operations', 'QA',
  'Project Management', 'DevOps', 'Data Science',
  'Security', 'Mobile', 'Other'
];

const STATUSES = ['All', 'Active', 'Inactive', 'On Leave'];

const DEPT_CONFIG = {
  Engineering:         { color: '#6366f1', bg: '#eef2ff', icon: '💻' },
  Design:              { color: '#ec4899', bg: '#fdf2f8', icon: '🎨' },
  Marketing:           { color: '#f59e0b', bg: '#fffbeb', icon: '📣' },
  Sales:               { color: '#10b981', bg: '#ecfdf5', icon: '📈' },
  HR:                  { color: '#8b5cf6', bg: '#f5f3ff', icon: '👥' },
  Finance:             { color: '#06b6d4', bg: '#ecfeff', icon: '💰' },
  Operations:          { color: '#f97316', bg: '#fff7ed', icon: '⚙️' },
  QA:                  { color: '#14b8a6', bg: '#f0fdfa', icon: '🔍' },
  'Project Management':{ color: '#6366f1', bg: '#eef2ff', icon: '📋' },
  DevOps:              { color: '#64748b', bg: '#f8fafc', icon: '🚀' },
  'Data Science':      { color: '#0ea5e9', bg: '#f0f9ff', icon: '📊' },
  Security:            { color: '#ef4444', bg: '#fef2f2', icon: '🔒' },
  Mobile:              { color: '#a855f7', bg: '#faf5ff', icon: '📱' },
  Other:               { color: '#78716c', bg: '#fafaf9', icon: '🏢' },
};

const STATUS_CONFIG = {
  Active:     { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  Inactive:   { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  'On Leave': { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
};

const AVATAR_COLORS = ['#6366f1','#ec4899','#10b981','#f59e0b','#06b6d4','#8b5cf6','#f97316','#14b8a6','#0ea5e9','#a855f7'];
const getColor = name => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getInitials = name => name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

function SkeletonCard() {
  return (
    <div className="emp-card skeleton-card">
      <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 14 }} />
      <div style={{ display:'flex', flexDirection:'column', gap: 8, marginTop: 8 }}>
        <div className="skeleton" style={{ height: 14, width: '70%' }} />
        <div className="skeleton" style={{ height: 12, width: '90%' }} />
        <div className="skeleton" style={{ height: 12, width: '50%' }} />
      </div>
    </div>
  );
}

export default function EmployeeList({ employees, loading, search, setSearch, filters, setFilters, onEdit, onDelete, onAddNew }) {
  return (
    <div className="emp-list-page">

      {/* Header */}
      <div className="list-header fade-up">
        <div>
          <div className="page-eyebrow">Team</div>
          <h1 className="page-title">All Employees</h1>
          <p className="page-sub">{employees.length} member{employees.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn-primary" onClick={onAddNew}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar fade-up" style={{ animationDelay: '.05s' }}>
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text" placeholder="Search by name, email, role..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="clear-btn" onClick={() => setSearch('')}>✕</button>}
        </div>

        <div className="filter-group">
          <div className="filter-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <select value={filters.department} onChange={e => setFilters({ ...filters, department: e.target.value })}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'All' ? '🏢 All Departments' : (DEPT_CONFIG[d]?.icon + ' ' + d)}</option>)}
            </select>
          </div>

          <div className="filter-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
              {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="cards-grid">{[1,2,3,4,5,6].map(n => <SkeletonCard key={n}/>)}</div>
      ) : employees.length === 0 ? (
        <div className="empty-state fade-up">
          <div className="empty-emoji">🔍</div>
          <h3>No employees found</h3>
          <p>Try adjusting your search or filters</p>
          <button className="btn-primary" onClick={onAddNew}>+ Add Employee</button>
        </div>
      ) : (
        <div className="cards-grid">
          {employees.map((emp, i) => {
            const dc = DEPT_CONFIG[emp.department] || DEPT_CONFIG.Other;
            const sc = STATUS_CONFIG[emp.status] || STATUS_CONFIG.Active;
            return (
              <div className="emp-card fade-up" key={emp._id} style={{ animationDelay: i * .04 + 's' }}>
                {/* Card top stripe */}
                <div className="card-stripe" style={{ background: `linear-gradient(90deg, ${dc.color}, ${dc.color}88)` }} />

                <div className="card-head">
                  <div className="card-avatar" style={{ background: getColor(emp.name) }}>
                    {getInitials(emp.name)}
                  </div>
                  <span className="card-status" style={{ background: sc.bg, color: sc.color }}>
                    <span className="status-dot-sm" style={{ background: sc.dot }} />
                    {emp.status}
                  </span>
                </div>

                <div className="card-body">
                  <h3 className="card-name">{emp.name}</h3>
                  <p className="card-role">{emp.role}</p>
                  <p className="card-email">{emp.email}</p>
                </div>

                <div className="card-tags">
                  <span className="dept-tag" style={{ background: dc.bg, color: dc.color }}>
                    {dc.icon} {emp.department}
                  </span>
                  <span className="salary-tag">${emp.salary?.toLocaleString()}</span>
                </div>

                {emp.phone && (
                  <div className="card-phone">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>
                    {emp.phone}
                  </div>
                )}

                <div className="card-actions">
                  <button className="card-btn edit-btn" onClick={() => onEdit(emp)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button className="card-btn del-btn" onClick={() => onDelete(emp._id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}