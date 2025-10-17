import axios from 'axios';

// Create a new axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Your backend base URL
});

// Use an interceptor to add the auth token to every request's header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;