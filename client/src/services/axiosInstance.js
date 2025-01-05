
// axiosInstance.js

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001', // Update to your backend server's URL
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store', // Disables caching for API responses
    Pragma: 'no-cache',           // HTTP/1.0 compatibility
  },
});

axiosInstance.interceptors.request.use(
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

export default axiosInstance;


//OLD AXIOS INSTANCE