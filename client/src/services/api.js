const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = {
  // Health check
  async health() {
    const res = await fetch(`${API_URL}/health`);
    return res.json();
  },

  // Student CRUD — will be implemented in Phase 3
  // async getStudents(params) { ... },
  // async getStudent(id) { ... },
  // async createStudent(data) { ... },
  // async updateStudent(id, data) { ... },
  // async deleteStudent(id) { ... },
};

export default api;
