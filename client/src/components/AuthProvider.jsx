import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ isAuthenticated: false, admin: null });
  const navigate = useNavigate();

  useEffect(() => {
    // Validate session on app load
    axiosInstance
      .get('/check-auth')
      .then((response) => {
        if (response.data.success) {
          setAuth({ isAuthenticated: true, admin: response.data.admin });
        } else {
          setAuth({ isAuthenticated: false, admin: null });
        }
      })
      .catch(() => {
        setAuth({ isAuthenticated: false, admin: null });
        navigate('/adminlogin'); // Redirect to login if not authenticated
      });
  }, []);

  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
