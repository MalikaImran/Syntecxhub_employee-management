import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const getEmployees = (params) => API.get('/employees', { params });
export const getEmployee  = (id)     => API.get(`/employees/${id}`);
export const createEmployee = (data) => API.post('/employees', data);
export const updateEmployee = (id, data) => API.put(`/employees/${id}`, data);
export const deleteEmployee = (id)   => API.delete(`/employees/${id}`);
export const getStats       = ()     => API.get('/employees/stats/overview');