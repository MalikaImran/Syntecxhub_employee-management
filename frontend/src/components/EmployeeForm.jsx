import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createEmployee, updateEmployee } from '../api';
import './EmployeeForm.css';

const DEPARTMENTS = [
  { value: 'Engineering',         icon: '💻', color: '#6366f1' },
  { value: 'Design',              icon: '🎨', color: '#ec4899' },
  { value: 'Marketing',           icon: '📣', color: '#f59e0b' },
  { value: 'Sales',               icon: '📈', color: '#10b981' },
  { value: 'HR',                  icon: '👥', color: '#8b5cf6' },
  { value: 'Finance',             icon: '💰', color: '#06b6d4' },
  { value: 'Operations',          icon: '⚙️', color: '#f97316' },
  { value: 'QA',                  icon: '🔍', color: '#14b8a6' },
  { value: 'Project Management',  icon: '📋', color: '#6366f1' },
  { value: 'DevOps',              icon: '🚀', color: '#64748b' },
  { value: 'Data Science',        icon: '📊', color: '#0ea5e9' },
  { value: 'Security',            icon: '🔒', color: '#ef4444' },
  { value: 'Mobile',              icon: '📱', color: '#a855f7' },
  { value: 'Other',               icon: '🏢', color: '#78716c' },
];

const STATUSES = [
  { value: 'Active',   icon: '✅', bg: '#dcfce7', color: '#166534' },
  { value: 'Inactive', icon: '❌', bg: '#fee2e2', color: '#991b1b' },
  { value: 'On Leave', icon: '🏖️', bg: '#fef9c3', color: '#854d0e' },
];

const INITIAL = { name:'', email:'', role:'', department:'Engineering', salary:'', phone:'', status:'Active' };

function validate(d) {
  const e = {};
  if (!d.name.trim() || d.name.trim().length < 2) e.name = 'Name required (min 2 chars)';
  if (!d.email.trim() || !/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Valid email required';
  if (!d.role.trim()) e.role = 'Job title required';
  if (!d.salary || isNaN(d.salary) || Number(d.salary) < 0) e.salary = 'Valid salary required';
  if (d.phone && !/^[+]?[\d\s\-()+]{7,15}$/.test(d.phone)) e.phone = 'Invalid phone format';
  return e;
}

export default function EmployeeForm({ employee, onSuccess, onCancel }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!employee;

  useEffect(() => {
    setForm(employee ? {
      name:       employee.name       || '',
      email:      employee.email      || '',
      role:       employee.role       || '',
      department: employee.department || 'Engineering',
      salary:     employee.salary?.toString() || '',
      phone:      employee.phone      || '',
      status:     employee.status     || 'Active',
    } : INITIAL);
    setErrors({});
  }, [employee]);

  const set = (name, value) => {
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    const payload = { ...form, salary: Number(form.salary) };
    try {
      if (isEdit) {
        await updateEmployee(employee._id, payload);
        toast.success('✅ Employee updated!');
      } else {
        await createEmployee(payload);
        toast.success('🎉 Employee added!');
      }
      onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDept = DEPARTMENTS.find(d => d.value === form.department);

  return (
    <div className="form-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="form-wrap fade-up">

        {/* Header */}
        <div className="form-hd">
          <div
            className="form-hd-icon"
            style={{ background: isEdit
              ? 'linear-gradient(135deg,#f59e0b,#f97316)'
              : 'linear-gradient(135deg,#6366f1,#7c3aed)' }}
          >
            {isEdit ? '✏️' : '➕'}
          </div>
          <div>
            <h2 className="form-title">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
            <p className="form-subtitle">
              {isEdit
                ? `Updating ${employee.name}'s profile`
                : 'Fill in the details to add a new team member'}
            </p>
          </div>
          <button className="form-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="form-body">

          {/* Personal Info */}
          <div className="form-section">
            <div className="form-section-title"><span>👤</span> Personal Information</div>
            <div className="form-grid-2">

              <div className={`field ${errors.name ? 'err' : ''}`}>
                <label>Full Name <span className="req">*</span></label>
                <input
                  type="text" value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Ali Hassan" disabled={submitting}
                />
                {errors.name && <div className="err-msg">⚠ {errors.name}</div>}
              </div>

              <div className={`field ${errors.email ? 'err' : ''}`}>
                <label>Email Address <span className="req">*</span></label>
                <input
                  type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="ali@company.com" disabled={submitting}
                />
                {errors.email && <div className="err-msg">⚠ {errors.email}</div>}
              </div>

              <div className={`field ${errors.phone ? 'err' : ''}`}>
                <label>Phone Number</label>
                <input
                  type="text" value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+92 300 1234567" disabled={submitting}
                />
                {errors.phone && <div className="err-msg">⚠ {errors.phone}</div>}
              </div>

              <div className={`field ${errors.role ? 'err' : ''}`}>
                <label>Job Title / Role <span className="req">*</span></label>
                <input
                  type="text" value={form.role}
                  onChange={e => set('role', e.target.value)}
                  placeholder="e.g. Senior Developer" disabled={submitting}
                />
                {errors.role && <div className="err-msg">⚠ {errors.role}</div>}
              </div>

            </div>
          </div>

          {/* Work Info */}
          <div className="form-section">
            <div className="form-section-title"><span>🏢</span> Work Information</div>
            <div className="form-grid-2">

              <div className={`field ${errors.salary ? 'err' : ''}`}>
                <label>Salary (USD) <span className="req">*</span></label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">$</span>
                  <input
                    type="number" value={form.salary}
                    onChange={e => set('salary', e.target.value)}
                    placeholder="85000" min="0" disabled={submitting}
                  />
                </div>
                {errors.salary && <div className="err-msg">⚠ {errors.salary}</div>}
              </div>

              {/* Department select — icon only in wrapper, NOT inside <option> text */}
              <div className="field">
                <label>Department <span className="req">*</span></label>
                <div className="dept-select-wrap" style={{ '--dc': selectedDept?.color }}>
                  <span className="dept-select-icon">{selectedDept?.icon}</span>
                  <select
                    value={form.department}
                    onChange={e => set('department', e.target.value)}
                    disabled={submitting}
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.value} value={d.value}>{d.value}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Quick Select Chips */}
            <div className="field" style={{ marginTop: '.5rem' }}>
              <label style={{ marginBottom: '.6rem', display: 'block' }}>Quick Select</label>
              <div className="dept-cards">
                {DEPARTMENTS.map(d => (
                  <button
                    key={d.value} type="button"
                    className={`dept-chip ${form.department === d.value ? 'selected' : ''}`}
                    style={{ '--dc': d.color, '--db': d.color + '18' }}
                    onClick={() => set('department', d.value)}
                    disabled={submitting}
                  >
                    <span>{d.icon}</span>
                    <span>{d.value}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="form-section">
            <div className="form-section-title"><span>🔖</span> Employment Status</div>
            <div className="status-cards">
              {STATUSES.map(s => (
                <label
                  key={s.value}
                  className={`status-card ${form.status === s.value ? 'selected' : ''}`}
                  style={{ '--sc': s.color, '--sb': s.bg }}
                >
                  <input
                    type="radio" name="status" value={s.value}
                    checked={form.status === s.value}
                    onChange={() => set('status', s.value)}
                    disabled={submitting}
                  />
                  <span className="sc-icon">{s.icon}</span>
                  <span className="sc-label">{s.value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting
                ? <><span className="spin" /> {isEdit ? 'Saving...' : 'Adding...'}</>
                : isEdit ? '✅ Save Changes' : '🚀 Add Employee'
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}