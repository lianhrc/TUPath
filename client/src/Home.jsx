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
                <input type="text" placeholder="Search" className="search-input" />
                <div className="dropdown">
                    <span className="dropdown-text">Talent</span>
                    <i className="dropdown-icon">▼</i>
                </div>
            </div>
            <div className='righthead'>
                <button onClick={handleLoginRedirect} className='loginbtn'>Login</button>
                <button onClick={handleSignupRedirect} className='signupbtn'>Sign up</button>
            </div>
        </header>
        <main>
            <div className='leftmain'> 
                <div className='leftmaincontent'>
                    <div className='leftmaincontenttop'>
                        <h1>Students & Experts to Scale the Network</h1>
                    </div>
                    <div className='leftmaincontentmid'>
                        <h6>Hire independent professionals to shorten development cycles, bury backlogs, and drive product growth.</h6>
                    </div>
                    <div className='leftmaincontentbottom'>
                        <button onClick={handleLoginRolesRedirect}>
                            Let's Get Started
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
