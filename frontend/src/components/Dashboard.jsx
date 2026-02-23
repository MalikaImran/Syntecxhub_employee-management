import './Dashboard.css';

const avatarColors = [
  "linear-gradient(135deg,#00d4ff,#0ea5e9)",
  "linear-gradient(135deg,#2563eb,#1d4ed8)",
  "linear-gradient(135deg,#06ffa5,#059669)",
  "linear-gradient(135deg,#ff6b6b,#dc2626)",
  "linear-gradient(135deg,#ffd93d,#d97706)",
  "linear-gradient(135deg,#f472b6,#9d174d)",
  "linear-gradient(135deg,#34d399,#0d9488)",
  "linear-gradient(135deg,#fb923c,#ea580c)",
];
const getColor = (name) => avatarColors[(name || 'A').charCodeAt(0) % avatarColors.length];

function StatusPill({ status }) {
  const map = { Active:'s-active', Inactive:'s-inactive', 'On Leave':'s-leave' };
  const dot = { Active:'● Active', Inactive:'● Inactive', 'On Leave':'● On Leave' };
  return <span className={`status-pill ${map[status]||'s-active'}`}>{dot[status]||status}</span>;
}

export default function Dashboard({ stats, employees, onViewAll, onAddNew, onStatClick, onEdit, onDelete }) {
  const total     = stats?.total    || 0;
  const active    = stats?.active   || 0;
  const onLeave   = stats?.onLeave  || 0;
  const inactive  = stats?.inactive || 0;
  const avgSalary = stats?.avgSalary|| 0;
  const byDept    = stats?.byDepartment || [];
  const maxDept   = Math.max(...byDept.map(d => d.count), 1);
  const recent    = [...employees].slice(0, 5);

  return (
    <div className="dashboard">

      {/* PAGE HEADER — sirf ek button yahan */}
      <div className="page-hd">
        <div className="page-title-wrap">
          <div className="eyebrow">Overview</div>
          <h1 className="page-title">Command Center</h1>
          <div className="page-count">
            {total} team member{total !== 1 ? 's' : ''} across departments
          </div>
        </div>
        <button className="btn-new" onClick={onAddNew}>
          <span className="plus">+</span> New Member
        </button>
      </div>

      {/* STAT CARDS — clickable */}
      <div className="stats-row">

        {/* Total — sirf dekhnay ke liye, View All */}
        <div className="stat-card stat-clickable" onClick={onViewAll} title="View all employees">
          <div className="stat-top">
            <div className="stat-icon">👥</div>
            <div className="stat-badge">All</div>
          </div>
          <div className="stat-val">{total}</div>
          <div className="stat-lbl">Total Employees</div>
          <div className="stat-bar"><div className="stat-bar-fill" style={{width:'100%'}}/></div>
          <div className="stat-hint">Click to view all →</div>
        </div>

        {/* Active */}
        <div className="stat-card stat-clickable stat-green" onClick={() => onStatClick('Active')} title="View active employees">
          <div className="stat-top">
            <div className="stat-icon">✅</div>
            <div className="stat-badge badge-green">Active</div>
          </div>
          <div className="stat-val">{active}</div>
          <div className="stat-lbl">Active Members</div>
          <div className="stat-bar"><div className="stat-bar-fill bar-green" style={{width: total ? `${active/total*100}%` : '0%'}}/></div>
          <div className="stat-hint">Click to filter →</div>
        </div>

        {/* On Leave */}
        <div className="stat-card stat-clickable stat-yellow" onClick={() => onStatClick('On Leave')} title="View on leave employees">
          <div className="stat-top">
            <div className="stat-icon">🏖️</div>
            <div className="stat-badge badge-yellow">Leave</div>
          </div>
          <div className="stat-val">{onLeave}</div>
          <div className="stat-lbl">On Leave</div>
          <div className="stat-bar"><div className="stat-bar-fill bar-yellow" style={{width: total ? `${onLeave/total*100}%` : '0%'}}/></div>
          <div className="stat-hint">Click to filter →</div>
        </div>

        {/* Avg Salary */}
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon">💰</div>
            <div className="stat-badge badge-purple">Avg</div>
          </div>
          <div className="stat-val">${Number(avgSalary).toLocaleString()}</div>
          <div className="stat-lbl">Average Salary</div>
          <div className="stat-bar"><div className="stat-bar-fill bar-purple" style={{width:'75%'}}/></div>
        </div>

      </div>

      {/* BOTTOM GRID */}
      <div className="dash-bottom">

        {/* DEPT CHART */}
        <div className="table-wrap dept-panel">
          <div className="dept-title">By Department</div>
          <div className="dept-bars">
            {byDept.length === 0 ? (
              <div className="no-data">No data yet</div>
            ) : (
              [...byDept].sort((a,b) => b.count - a.count).map(d => (
                <div className="dept-bar-row" key={d._id}>
                  <div className="dept-bar-lbl">{d._id}</div>
                  <div className="dept-bar-track">
                    <div className="dept-bar-fill" style={{width:`${d.count/maxDept*100}%`}}/>
                  </div>
                  <div className="dept-bar-cnt">{d.count}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT TABLE */}
        <div className="table-wrap">
          <div className="recent-header">
            <span className="recent-title">Recent Employees</span>
            <button className="view-all-btn" onClick={onViewAll}>View All →</button>
          </div>
          <table className="emp-table">
            <thead>
              <tr>
                <th>Employee</th><th>Role</th><th>Salary</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan="5">
                    <div className="empty-inner">
                      <div className="empty-ico">🚀</div>
                      <div className="empty-txt">No employees yet — use "New Member" button above!</div>
                    </div>
                  </td>
                </tr>
              ) : (
                recent.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <div className="emp-cell">
                        <div className="emp-av" style={{background: getColor(emp.name)}}>{(emp.name||'?')[0]}</div>
                        <div>
                          <div className="emp-nm">{emp.name}</div>
                          <div className="emp-em">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="role-tag">{emp.role}</span></td>
                    <td><span className="sal-val">${emp.salary.toLocaleString()}</span></td>
                    <td><StatusPill status={emp.status}/></td>
                    <td>
                      <div className="action-cell">
                        <button className="act-btn edit" onClick={() => onEdit(emp)} title="Edit">✏️</button>
                        <button className="act-btn del"  onClick={() => onDelete(emp._id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}