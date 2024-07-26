import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function LoginRoles() {
    const [role, setRole] = useState('student');

    return (
        <div className="container mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div style={{ maxWidth: '400px', textAlign: 'center' }}>
                <h1 className="mb-4">TUPath</h1>
                <h3 className="mb-4">Join as a student or employer</h3>
                <div className="d-flex justify-content-around mb-4">
                    <div className="card" style={{ width: '48%' }}>
                        <div className="card-body" onClick={() => setRole('student')}>
                            <h5 className="card-title">I'm a TUP student, for academic profiling</h5>
                            <input type="radio" name="role" className="form-check-input mt-2" checked={role === 'student'} />
                        </div>
                    </div>
                    <div className="card" style={{ width: '48%' }}>
                        <div className="card-body" onClick={() => setRole('expert')}>
                            <h5 className="card-title">I'm an expert, looking for potential students for work or a project</h5>
                            <input type="radio" name="role" className="form-check-input mt-2" checked={role === 'expert'} />
                        </div>
                    </div>
                </div>
                <Link to={`/${role}`} className="btn btn-danger btn-block">Join as {role === 'student' ? 'Student' : 'Expert'}</Link>
                <p className="mt-3">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginRoles;
