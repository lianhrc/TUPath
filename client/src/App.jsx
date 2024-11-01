import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentSignup from './components/pages/Signup/StudentSignup';
import ExpertSignup from './components/pages/Signup/ExpertSignup';
import Login from './components/pages/Login/Login';
import LoginRoles from './components/pages/Login/LoginRoles';
import Landingpage from './components/pages/Main/Landingpage';
import Studentlandpage from './components/pages/Main/studentlandpage';
import Employerlandpage from './components/pages/Main/employerlandpage';
import StudentHomepage from './components/pages/Home/StudentHomepage';
import EmployeeHomepage from './components/pages/Home/EmployeeHomepage';
import StudentProfileCreation from './components/pages/Profile/StudentProfileCreation';
import EmployeeProfileCreation from './components/pages/Profile/EmployeeProfileCreation';
import StudentProfile from './components/pages/Profile/Profilepage';
import Inboxpage from './components/pages/Inbox/Inboxpage';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Settings from './components/pages/Settings/settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landingpage />} />  
        
        {/* Protected Routes */}
        <Route 
          path='/studentlandpage' 
          element={
            <ProtectedRoute>
              <Studentlandpage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/studenthomepage' 
          element={
            <ProtectedRoute>
              <StudentHomepage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/employeehomepage' 
          element={
            <ProtectedRoute>
              <EmployeeHomepage />
            </ProtectedRoute>
          } 
        />

        {/* Public Routes */}
        <Route path='/employerlandpage' element={<Employerlandpage />} />
        <Route path='/studentsignup' element={<StudentSignup />} />
        <Route path='/expertsignup' element={<ExpertSignup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/loginroles' element={<LoginRoles />} /> 
        <Route path='/studentprofilecreation' element={<StudentProfileCreation />} />
        <Route path='/employeeprofilecreation' element={<EmployeeProfileCreation />} />
        <Route path='/StudentProfile' element={<StudentProfile />} />
        <Route path='/Inboxpage' element={<Inboxpage />} />
        <Route path='/Settings' element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
