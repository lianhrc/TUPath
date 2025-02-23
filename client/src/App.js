import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/pages/Home/Homepage';
import Login from './components/pages/Login/Login';
import LoginRoles from './components/pages/Login/LoginRoles';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/loginroles" element={<LoginRoles />} />
        <Route path="/homepage" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
