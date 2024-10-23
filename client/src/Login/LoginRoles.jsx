import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginRoles.css';

function LoginRoles() {
    const [role, setRole] = useState('student');

    // Define URLs for each role
    const studentUrl = 'https://yourdomain.com/student';
    const expertUrl = 'https://yourdomain.com/expert';

    return (
        <div className="container mt-1 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh'}}>
            <div style={{ maxWidth: '600px', textAlign: 'center'}}>
                <h3 className="mb-4">Join as a student or employer</h3>
                <div className="card-choice d-flex justify-content-around mb-3">
                    <div className="card" style={{ width: '70%' , margin: '10px', padding: '10px'}}>
                        <div className='topcard'>
                            <div>icon</div>
                            <input 
                                type="radio" 
                                name="role" 
                                id="student" 
                                className="form-check-input custom-radio" 
                                checked={role === 'student'} 
                                onChange={() => setRole('student')} 
                            />
                            <label htmlFor="student" className="custom-label"></label>
                        </div>
                        <div className="card-body" onClick={() => setRole('student')}>
                            <h5 className="card-title">I'm a TUP student, for academic profiling</h5>
                        </div>
                    </div>
                    <div className="card" style={{ width: '70%', margin: '10px' , padding: '10px'}}>
                        <div className='topcard'>
                            <div>icon</div>
                            <input 
                                type="radio" 
                                name="role" 
                                id="expert" 
                                className="form-check-input custom-radio" 
                                checked={role === 'expert'} 
                                onChange={() => setRole('expert')} 
                            />
                            <label htmlFor="expert" className="custom-label"></label>
                        </div>
                        <div className="card-body" onClick={() => setRole('expert')}>
                            <h5 className="card-title">I'm an expert, looking for potential students for work or a project</h5>
                        </div>
                    </div>
                </div>
                
                {/* Dynamically set the URL based on the selected role */}
                <a 
                    href={role === 'student' ? '/StudentSignup' : 'expertUrl'} 
                    className="join-button"
                >
                    Join as {role === 'student' ? 'Student' : 'Expert'}
                </a>

                <p className="mt-3">
                    Already have an account? <a className='linklogin' href="/login">Log in</a>
                </p>
            </div>
        </div>
    );
}

export default LoginRoles;
