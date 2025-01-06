import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentSignup from './components/pages/Signup/StudentSignup.jsx';
import EmployerSignup from './components/pages/Signup/EmployerSignup.jsx';
import Login from './components/pages/Login/Login';
import EmployerProfileCreation from './components/pages/Profile/EmployerProfileCreation.jsx';
import LoginRoles from './components/pages/Login/LoginRoles';
import Landingpage from './components/pages/Main/Landingpage';
import Studentlandpage from './components/pages/Main/studentlandpage';
import AdminLogin from './components/pages/admin/AdminLogin.jsx';
import AdminDashboard from './components/pages/admin/AdminDashboard.jsx'; // Admin dashboard component
import Employerlandpage from './components/pages/Main/employerlandpage';
import Homepage from './components/pages/Home/Homepage';
import StudentProfileCreation from './components/pages/Profile/StudentProfileCreation';
import Profile from './components/pages/Profile/Profilepage';
import Inboxpage from './components/pages/Inbox/Inboxpage';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Settings from './components/pages/Settings/settings';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ForgotPassword from './components/pages/Login/ForgotPassword.jsx';
import ResetPassword from './components/pages/Login/ResetPassword.jsx';
import './App.css'
import UserProfile from './components/pages/Profile/UserProfile'; // Updated path
import AdminSignup from './components/pages/admin/AdminSignup.jsx';
import QuestionManager from './components/pages/admin/QuestionManager.jsx';
import { AuthProvider } from './components/AuthProvider.jsx';
import { useState, useEffect } from 'react';
import axiosInstancev2 from './services/axiosInstancev2'; // Update this line to use correct path

function App() {
  // Add a protected route component
  const ProtectedAdminRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await axiosInstancev2.get('/check-auth');
          setIsAuthenticated(response.data.success);
        } catch (error) {
          setIsAuthenticated(false);
        }
      };
      checkAuth();
    }, []);

    if (isAuthenticated === null) {
      return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/adminlogin" />;
  };

  return (
    <GoogleOAuthProvider clientId="625352349873-hrob3g09um6f92jscfb672fb87cn4kvv.apps.googleusercontent.com">
    <BrowserRouter>
    {/* Place ToastContainer here */}
    
    <ToastContainer />
    <Routes>
          <Route path='/' element={<Landingpage />} />  
          <Route path="/profile/:id" element={<UserProfile />} />
          {/* Protected Routes */}       
          <Route 
            path='/homepage' 
            element={
              <ProtectedRoute>
                <Homepage />
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
            path='/Profile' 
            element={
              <ProtectedRoute>
                <Profile />
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path='/employerlandpage' element={<Employerlandpage />} />
          <Route path='/studentlandpage' element={<Studentlandpage />} />
          <Route path='/studentsignup' element={<StudentSignup />} />
          <Route path='/employersignup' element={<EmployerSignup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/loginroles' element={<LoginRoles />} /> 
          <Route path='/studentprofilecreation' element={<StudentProfileCreation />} />
          <Route path='/employerprofilecreation' element={<EmployerProfileCreation />} />

            

          <Route path='/adminlogin' element={<AdminLogin />} />
          <Route path='/admindashboard' element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path='/adminsignup' element={<AdminSignup />} />
          <Route path='/questionmanager' element={<QuestionManager />} />

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
