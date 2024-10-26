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
import EmployeeHomepage from './Homepage/EmployeeHomepage';
import StudentProfileCreation from './Profilepage/StudentProfileCreation';
import EmployeeProfileCreation from './Profilepage/EmployeeProfileCreation';
import StudentProfile from './Profilepage/Profilepage';

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
