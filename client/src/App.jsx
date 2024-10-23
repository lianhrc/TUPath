import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentSignup from './Signup/StudentSignup';
import ExpertSignup from './Signup/ExpertSignup';
import Login from './Login/Login';
import LoginRoles from './Login/LoginRoles';
import Landingpage from './Landingpages/Landingpage';
import Studentlandpage from './Landingpages/studentlandpage';
import Employerlandpage from './Landingpages/employerlandpage';
import StudentHomepage from './Homepage/StudentHomepage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landingpage />} />
        <Route path='/studentlandpage' element={<Studentlandpage />} />
        <Route path='/employerlandpage' element={<Employerlandpage />} />
        <Route path='/studentsignup' element={<StudentSignup />} />
        <Route path='/expertsignup' element={<ExpertSignup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/loginroles' element={<LoginRoles />} /> {/* Add route for LoginRoles */}
        <Route path='/studenthomepage' element={<StudentHomepage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
