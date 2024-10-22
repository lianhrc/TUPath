import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import LoginRoles from './LoginRoles';
import Home from './Landingpage';
import Homepage from './Homepage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/loginroles' element={<LoginRoles />} /> {/* Add route for LoginRoles */}
        <Route path='/homepage' element={<Homepage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
