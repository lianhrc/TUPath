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
import EmployeeProfileCreation from './components/pages/Profile/EmployerProfileCreation.jsx';
import StudentProfile from './components/pages/Profile/Profilepage';
import Inboxpage from './components/pages/Inbox/Inboxpage';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Settings from './components/pages/Settings/settings';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="625352349873-hrob3g09um6f92jscfb672fb87cn4kvv.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Landingpage />} />  

          {/* Protected Routes */}
       
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

          <Route 
          path='/Inboxpage' 
          element={
            <ProtectedRoute>
              <Inboxpage />
            </ProtectedRoute>
          } 
        />

          <Route 
          path='/StudentProfile' 
          element={
            <ProtectedRoute>
              <StudentProfile />
            </ProtectedRoute>
          } 
        />

          <Route 
          path='/Settings' 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />

          <Route path='/employerlandpage' element={<Employerlandpage />} />
          <Route path='/studentlandpage' element={<Studentlandpage />} />
          <Route path='/studentsignup' element={<StudentSignup />} />
          <Route path='/expertsignup' element={<ExpertSignup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/loginroles' element={<LoginRoles />} /> 
          <Route path='/studentprofilecreation' element={<StudentProfileCreation />} />
          <Route path='/employeeprofilecreation' element={<EmployeeProfileCreation />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
