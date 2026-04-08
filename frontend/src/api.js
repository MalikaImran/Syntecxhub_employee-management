import axios from 'axios';

const API = axios.create({
  baseURL:         'http://localhost:5000/api',
  withCredentials: true, // required for CSRF cookie
});

// ─────────────────────────────────────────────────────────────────
// WEEK 5 TASK 3: Fetch CSRF token from backend on startup
// ─────────────────────────────────────────────────────────────────
let csrfToken = null;

export const fetchCsrfToken = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/csrf-token', {
      withCredentials: true,
    });
    csrfToken = res.data.csrfToken;
  } catch (err) {
    console.error('Could not fetch CSRF token:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────
// WEEK 4: Attach JWT token to every request
// WEEK 5: Attach CSRF token to every state-changing request
// ─────────────────────────────────────────────────────────────────
API.interceptors.request.use((config) => {
  // JWT token
  const token = localStorage.getItem('staffhub_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  // CSRF token — only for POST, PUT, DELETE
  const method = config.method?.toUpperCase();
  if (['POST', 'PUT', 'DELETE'].includes(method) && csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Auto logout if token expired
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const msg = error.response?.data?.message || '';
      // Only logout for auth errors, not CSRF errors
      if (msg.includes('token') || msg.includes('Access denied')) {
        localStorage.removeItem('staffhub_token');
        localStorage.removeItem('staffhub_user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const getEmployees   = (params) => API.get('/employees', { params });
export const getEmployee    = (id)     => API.get(`/employees/${id}`);
export const createEmployee = (data)   => API.post('/employees', data);
export const updateEmployee = (id, d)  => API.put(`/employees/${id}`, d);
export const deleteEmployee = (id)     => API.delete(`/employees/${id}`);
export const getStats       = ()       => API.get('/employees/stats/overview');