// ProtectedRoute.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If user tries to access the login or landing page, redirect to homepage
  if (location.pathname === '/login' || location.pathname === '/') {
    return <Navigate to="/studenthomepage" replace />;
  }

  return children;
};

export default ProtectedRoute;
