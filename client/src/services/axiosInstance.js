// axiosInstance.js

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001', // Ensure this matches your backend server URL
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store', // Disables caching for API responses
    Pragma: 'no-cache',           // HTTP/1.0 compatibility
  },
  withCredentials: true // Enable sending cookies with requests
});

export default axiosInstance;