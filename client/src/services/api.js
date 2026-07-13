const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(method, path, body = null, isFormData = false) {
  const opts = { method };

  if (body) {
    if (isFormData) {
      opts.body = body;
    } else {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_URL}${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = res.status;
    error.errors = data.errors || [];
    throw error;
  }

  return data;
}

const api = {
  health: () => request('GET', '/health'),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.set(key, val);
    });
    const qs = query.toString();
    return request('GET', `/students${qs ? `?${qs}` : ''}`);
  },

  getStudent: (id) => request('GET', `/students/${id}`),

  getStudentStats: () => request('GET', '/students/stats'),

  createStudent: (formData) => request('POST', '/students', formData, true),

  updateStudent: (id, formData) => request('PUT', `/students/${id}`, formData, true),

  deleteStudent: (id) => request('DELETE', `/students/${id}`),

  // Activity Logs
  getActivityLogs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.set(key, val);
    });
    const qs = query.toString();
    return request('GET', `/activity-logs${qs ? `?${qs}` : ''}`);
  },
};

export default api;
