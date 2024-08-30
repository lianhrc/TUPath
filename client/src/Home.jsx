import React from 'react'
import { useNavigate } from 'react-router-dom';
import './Home.css'

function Home() {
    const navigate = useNavigate();

    const handleLoginRedirect = () => {
        console.log('Redirecting to login page');
        navigate('/login');
    };

    const handleSignupRedirect = () => {
        console.log('Redirecting to signup page');
        navigate('/register');
    };

    const handleLoginRolesRedirect = () => {
        console.log('Redirecting to loginroles page');
        navigate('/loginroles');
    };

  return (
    <div>
    
        <header>
            <div className='lefthead'>TUPath Logo</div>
            <div className='centerhead'>
               
            </div>
            <div className='righthead'>
                <button onClick={handleLoginRedirect} className='loginbtn'>Login</button>
                <button onClick={handleSignupRedirect} className='signupbtn'>Sign up</button>
            </div>
        </header>
        <main>
            <div className='leftmain'> 
                <div className='leftmaincontent'>
                    <div className='leftmaincontenttop'>TUP STUDENTS</div>
                    <div className='leftmaincontentmid'></div>
                    <div className='leftmaincontentbottom'>
                        <button onClick={handleLoginRolesRedirect}>
                            Get Started
                        </button>
                    </div>
                </div>
            </div>     
            <div className='rightmain'> </div>     
        
        </main>
        <footer>
        
        </footer>
    </div>
  )
}

export default Home
