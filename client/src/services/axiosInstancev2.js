import axios from 'axios';

const axiosInstancev2 = axios.create({
  baseURL: 'http://localhost:3001', // Update to your backend server's URL
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store', // Disables caching for API responses
    Pragma: 'no-cache',           // HTTP/1.0 compatibility
  },
  withCredentials: true, // Enables sending cookies with requests
});

export default axiosInstancev2;
