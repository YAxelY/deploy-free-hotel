import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './login.css'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        const credentials = { email, password };
        const res = await fetch('http://localhost:8000/api/auth/token-auth/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        const data = await res.json();
        if (res.ok && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.user.is_hotel_owner ? 'ADMIN' : 'CLIENT');
            if (data.user) {
                if (data.user.username) localStorage.setItem('userName', data.user.username);
                if (data.user.email) localStorage.setItem('userEmail', data.user.email);
            }
            // Redirect based on role
            if (data.user && data.user.is_hotel_owner) {
                navigate('/dashboard');
            } else {
                // Redirect client to previous page or /rooms
                const from = location.state?.from || '/';
                navigate(from, { replace: true });
            }
        } else {
            alert('Login failed: ' + (data.detail || 'Unknown error'));
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = '/';
    };

    return (
        <div className="login-form-container">
            {/* Show logout button if logged in */}
            {localStorage.getItem('token') && (
                <button className="btn" style={{ position: 'absolute', top: 16, right: 16 }} onClick={logout}>
                    Log out
                </button>
            )}
            <form onSubmit={handleLogin}>
                <h2 className="section-header login-form-header">Login</h2>
                <div className="login-content">
                    <div className="box-container">
                        <FontAwesomeIcon icon={['fas', 'fa-envelope']} />
                        <input
                            type="email"
                            className="box"
                            placeholder="Enter your Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="box-container">
                        <FontAwesomeIcon icon={['fas', 'fa-lock']} />
                        <input
                            type="password"
                            className="box"
                            placeholder="Enter your Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="buttons">
                        <button type="submit" className="link btn">Log in</button>
                        <Link to="/" className="link btn">Cancel</Link>
                    </div>
                    <div className="form-links">
                        <Link to="/" className="link"><p>Forgot password? <span>Click Here</span></p></Link>
                        <Link to="/signUp" className="link"><p>Do not have an account? <span>Sign up</span></p></Link>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Login;

