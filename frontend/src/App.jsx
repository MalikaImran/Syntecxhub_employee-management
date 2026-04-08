import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeProfile from './components/EmployeeProfile';
import EmployeeForm from './components/EmployeeForm';
import { getEmployees, deleteEmployee, getStats, fetchCsrfToken } from './api';
import './App.css';

export default function App() {
  // AUTH STATE
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('staffhub_user');
    return saved ? JSON.parse(saved) : null;
  });

  // APP STATE
  const [view, setView]               = useState(() => user?.role === 'admin' ? 'dashboard' : 'profile');
  const [allEmployees, setAll]        = useState([]);
  const [stats, setStats]             = useState(null);
  const [editingEmp, setEditingEmp]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [filters, setFilters]         = useState({ department:'', status:'' });
  const [showForm, setShowForm]       = useState(false);

  const isAdmin = user?.role === 'admin';

  // FETCH
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees({});
      setAll(res.data.data);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    try { const res = await getStats(); setStats(res.data.data); } catch {}
  }, []);

  const refreshAll = useCallback(async () => {
    await fetchEmployees();
    await fetchStats();
  }, [fetchEmployees, fetchStats]);

  // WEEK 5: Fetch CSRF token when app starts
  useEffect(() => { fetchCsrfToken(); }, []);

  useEffect(() => {
    if (user) refreshAll();
  }, [user, refreshAll]);

  // FILTER
  const filteredEmployees = allEmployees.filter(e => {
    const s = search.toLowerCase();
    const ms = !search.trim() || e.name.toLowerCase().includes(s) || e.email.toLowerCase().includes(s) || e.role.toLowerCase().includes(s) || e.department.toLowerCase().includes(s);
    const md = !filters.department || e.department === filters.department;
    const mst = !filters.status || e.status === filters.status;
    return ms && md && mst;
  });

  // HANDLERS
  const handleLogin  = (u) => { setUser(u); setView(u.role === 'admin' ? 'dashboard' : 'profile'); };
  const handleLogout = ()  => { localStorage.removeItem('staffhub_user'); setUser(null); setView('dashboard'); };

  const handleViewAll   = () => { setSearch(''); setFilters({ department:'', status:'' }); setView('employees'); };
  const handleStatClick = (status) => { setSearch(''); setFilters({ department:'', status }); setView('employees'); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try { await deleteEmployee(id); toast.success('Employee deleted'); refreshAll(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleEdit       = (emp) => { setEditingEmp(emp); setShowForm(true); };
  const handleAddNew     = ()    => { setEditingEmp(null); setShowForm(true); };
  const handleFormSuccess = async () => { await refreshAll(); setShowForm(false); setEditingEmp(null); };

  // NOT LOGGED IN → show login
  if (!user) return (
    <>
      <Toaster position="top-right"/>
      <Login onLogin={handleLogin}/>
    </>
  );

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{ style: { background:'rgba(24,24,37,0.97)', color:'#e8e8ff', border:'1px solid rgba(0,212,255,0.2)', borderRadius:'12px', fontFamily:'Outfit,sans-serif', fontSize:'.875rem', fontWeight:'600' } }}
      />

      <Navbar view={view} setView={setView} user={user} onLogout={handleLogout}/>

      <main className="main">

        {/* ADMIN VIEWS */}
        {isAdmin && view === 'dashboard' && (
          <Dashboard stats={stats} employees={allEmployees} onViewAll={handleViewAll} onAddNew={handleAddNew} onStatClick={handleStatClick} onEdit={handleEdit} onDelete={handleDelete}/>
        )}
        {isAdmin && view === 'employees' && (
          <EmployeeList employees={filteredEmployees} loading={loading} search={search} setSearch={setSearch} filters={filters} setFilters={setFilters} onEdit={handleEdit} onDelete={handleDelete} onAddNew={handleAddNew}/>
        )}

        {/* EMPLOYEE VIEW — sirf apna profile */}
        {!isAdmin && view === 'profile' && (
          <EmployeeProfile user={user} employees={allEmployees}/>
        )}

        {/* GUARD — employee dashboard access nahi kar sakta */}
        {!isAdmin && view !== 'profile' && (
          <div style={{textAlign:'center', padding:'5rem 2rem'}}>
            <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🔒</div>
            <h2 style={{color:'#e8e8ff', marginBottom:'.5rem'}}>Access Denied</h2>
            <p style={{color:'#7878a0'}}>Tumhare role mein yeh page nahi hai.</p>
          </div>
        )}

      </main>

      {isAdmin && showForm && (
        <EmployeeForm employee={editingEmp} onSuccess={handleFormSuccess} onCancel={() => { setShowForm(false); setEditingEmp(null); }}/>
      )}
    </div>
  );
}