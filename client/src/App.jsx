import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './Signup/Signup';
import Login from './Login/Login';
import LoginRoles from './Login/LoginRoles';
import Landingpage from './Landingpage/Landingpage';
import Homepage from './Homepage/Homepage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landingpage />} />
        <Route path='/register' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/loginroles' element={<LoginRoles />} /> {/* Add route for LoginRoles */}
        <Route path='/homepage' element={<Homepage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
