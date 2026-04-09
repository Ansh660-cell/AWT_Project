const API_URL = '/api';

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  },

  auth: {
    login: (credentials: any) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  },

  tasks: {
    getAll: () => api.request('/tasks'),
    create: (taskData: any) => api.request('/tasks', { method: 'POST', body: JSON.stringify(taskData) }),
    update: (id: string, taskData: any) => api.request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(taskData) }),
    delete: (id: string) => api.request(`/tasks/${id}`, { method: 'DELETE' }),
  },
};
