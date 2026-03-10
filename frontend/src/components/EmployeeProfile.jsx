import './EmployeeProfile.css';

const avatarColors = [
  "linear-gradient(135deg,#00d4ff,#0ea5e9)",
  "linear-gradient(135deg,#2563eb,#1d4ed8)",
  "linear-gradient(135deg,#06ffa5,#059669)",
  "linear-gradient(135deg,#ff6b6b,#dc2626)",
  "linear-gradient(135deg,#ffd93d,#d97706)",
];
const getColor = (name) => avatarColors[(name||'A').charCodeAt(0) % avatarColors.length];

function StatusPill({ status }) {
  const map = { Active:'s-active', Inactive:'s-inactive', 'On Leave':'s-leave' };
  const dot = { Active:'● Active', Inactive:'● Inactive', 'On Leave':'● On Leave' };
  return <span className={`status-pill ${map[status]||'s-active'}`}>{dot[status]||status}</span>;
}

export default function EmployeeProfile({ user, employees }) {
  // Find this employee's data from the list
  const empData = employees.find(e =>
    e.email.toLowerCase() === user.email.toLowerCase()
  );

  if (!empData) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <div className="empty-ico">👤</div>
          <h2>Profile Not Found</h2>
          <p>Tumhara employee record abhi system mein nahi hai.<br/>Admin se contact karo.</p>
        </div>
      </div>
    );
  }

  const fields = [
    { label: 'Full Name',   value: empData.name,       icon: '👤' },
    { label: 'Email',       value: empData.email,      icon: '📧' },
    { label: 'Phone',       value: empData.phone||'—', icon: '📞' },
    { label: 'Role',        value: empData.role,       icon: '💼' },
    { label: 'Department',  value: empData.department, icon: '🏢' },
    { label: 'Salary',      value: `$${empData.salary.toLocaleString()}`, icon: '💰' },
    { label: 'Join Date',   value: empData.joinDate ? new Date(empData.joinDate).toLocaleDateString('en-PK', {year:'numeric',month:'long',day:'numeric'}) : '—', icon: '📅' },
  ];

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-av" style={{background: getColor(empData.name)}}>
          {empData.name[0]}
        </div>
        <div className="profile-hd-info">
          <div className="profile-eyebrow">My Profile</div>
          <h1 className="profile-name">{empData.name}</h1>
          <div className="profile-role-row">
            <span className="role-tag">{empData.role}</span>
            <span className="dept-tag">{empData.department}</span>
            <StatusPill status={empData.status}/>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="profile-grid">
        {fields.map(f => (
          <div className="profile-field" key={f.label}>
            <div className="field-icon">{f.icon}</div>
            <div className="field-info">
              <div className="field-label">{f.label}</div>
              <div className="field-value">{f.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Notice */}
      <div className="profile-notice">
        ℹ️ Profile update karne ke liye Admin ya HR se contact karo.
      </div>
    </div>
  );
}