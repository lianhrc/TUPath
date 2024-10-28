import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentSignup from './components/pages/Signup/StudentSignup';
import ExpertSignup from './components/pages/Signup/ExpertSignup';
import Login from './components/pages/Login/Login';
import LoginRoles from './components/pages/Login/LoginRoles';
import Landingpage from './components/pages/Landingpages/Landingpage';
import Studentlandpage from './components/pages/Landingpages/studentlandpage';
import Employerlandpage from './components/pages/Landingpages/employerlandpage';
import StudentHomepage from './components/pages/Homepage/StudentHomepage';
import EmployeeHomepage from './components/pages/Homepage/EmployeeHomepage';
import StudentProfileCreation from './components/pages/Profilepage/StudentProfileCreation';
import EmployeeProfileCreation from './components/pages/Profilepage/EmployeeProfileCreation';
import StudentProfile from './components/pages/Profilepage/Profilepage';

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
        <Route path='/employeehomepage' element={<EmployeeHomepage />} />
        <Route path='/studentprofilecreation' element={<StudentProfileCreation />} />
        <Route path='/employeeprofilecreation' element={<EmployeeProfileCreation />} />
        <Route path='/StudentProfile' element={<StudentProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
