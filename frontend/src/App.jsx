import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import { getEmployees, deleteEmployee, getStats } from './api';
import './App.css';

export default function App() {
  const [view, setView]                   = useState('dashboard');
  const [allEmployees, setAllEmployees]   = useState([]);
  const [stats, setStats]                 = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading]             = useState(false);
  const [search, setSearch]               = useState('');
  const [filters, setFilters]             = useState({ department: '', status: '' });
  const [showForm, setShowForm]           = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees({});
      setAllEmployees(res.data.data);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getStats();
      setStats(res.data.data);
    } catch {}
  }, []);

  const refreshAll = useCallback(async () => {
    await fetchEmployees();
    await fetchStats();
  }, [fetchEmployees, fetchStats]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  // Local filtering
  const filteredEmployees = allEmployees.filter(e => {
    const s = search.toLowerCase();
    const matchSearch = !search.trim() ||
      e.name.toLowerCase().includes(s) ||
      e.email.toLowerCase().includes(s) ||
      e.role.toLowerCase().includes(s) ||
      e.department.toLowerCase().includes(s);
    const matchDept   = !filters.department || e.department === filters.department;
    const matchStatus = !filters.status     || e.status     === filters.status;
    return matchSearch && matchDept && matchStatus;
  });

  // FIX 2: View All → clear ALL filters first, then switch
  const handleViewAll = () => {
    setSearch('');
    setFilters({ department: '', status: '' });
    setView('employees');
  };

  // FIX 3: Stat card click → filter by that status
  const handleStatClick = (status) => {
    setSearch('');
    setFilters({ department: '', status });
    setView('employees');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await deleteEmployee(id);
      toast.success('Employee deleted');
      refreshAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEdit       = (emp) => { setEditingEmployee(emp); setShowForm(true); };
  const handleAddNew     = ()    => { setEditingEmployee(null); setShowForm(true); };
  const handleFormSuccess = async () => {
    await refreshAll();
    setShowForm(false);
    setEditingEmployee(null);
  };

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(24,24,37,0.97)',
            color: '#e8e8ff',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '12px',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '.875rem',
            fontWeight: '600',
            backdropFilter: 'blur(16px)',
          },
        }}
      />

      <Navbar view={view} setView={setView} />

      <main className="main">
        {view === 'dashboard' && (
          <Dashboard
            stats={stats}
            employees={allEmployees}
            onViewAll={handleViewAll}
            onAddNew={handleAddNew}
            onStatClick={handleStatClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        {view === 'employees' && (
          <EmployeeList
            employees={filteredEmployees}
            loading={loading}
            search={search}
            setSearch={setSearch}
            filters={filters}
            setFilters={setFilters}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={handleAddNew}
          />
        )}
      </main>

      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditingEmployee(null); }}
        />
      )}
    </div>
  );
}