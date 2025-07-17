import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import './client.css'

const API_BASE = 'http://localhost:8000/api/auth'; // Updated to point to Django backend

const Client = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // 1. Register user
            const regRes = await fetch(`${API_BASE}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    password: form.password
                })
            });
            if (!regRes.ok) {
                const data = await regRes.json();
                throw new Error(data?.email?.[0] || data?.username?.[0] || data?.password?.[0] || 'Registration failed');
            }
            // 2. Login user
            const loginRes = await fetch(`${API_BASE}/token-auth/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username_or_email: form.email, password: form.password })
            });
            // if (!loginRes.ok) {
            //     throw new Error('Login failed');
            // }
            const loginData = await loginRes.json();
            const token = loginData.token;
            // 3. Success: store token, alert, redirect
            localStorage.setItem('token', token);
            if (form.username) localStorage.setItem('userName', form.username);
            if (form.email) localStorage.setItem('userEmail', form.email);
            alert('Registered successfully as client!');
            navigate('/rooms');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="client-form-container">
            <form onSubmit={handleSubmit}>
                <Link to="/signUp" className="link">
                    <FontAwesomeIcon icon={['fas', 'fa-arrow-left']} />&nbsp;Back
                </Link>
                <h2 className="section-header client-form-header">Register as a Client</h2>
                <div className="client-content">
                    <div className="box-container">
                        <FontAwesomeIcon icon={['fas', 'fa-user']} />
                        <input type="text" className="box" name="username" value={form.username} onChange={handleChange} placeholder="Enter a Username" required />
                    </div>
                    <div className="box-container">
                        <FontAwesomeIcon icon={['fas', 'fa-envelope']} />
                        <input type="email" className="box" name="email" value={form.email} onChange={handleChange} placeholder="Enter your Email" required />
                    </div>
                    <div className="box-container">
                        <FontAwesomeIcon icon={['fas', 'fa-lock']} />
                        <input type="password" className="box" name="password" value={form.password} onChange={handleChange} placeholder="Enter a Password" required />
                    </div>
                    {error && <div style={{ color: 'red', textAlign: 'center', margin: '0.5rem 0' }}>{error}</div>}
                    <div className="buttons">
                        <button className="btn" type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
                        <Link to="/" className="link btn">Cancel</Link>
                    </div>
                    <div className="form-links">
                        <p><input type="checkbox" />&nbsp;&nbsp;Remember Me</p>
                        <Link to="/login" className="link"><p>Already have an account? <span>Login</span></p></Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Client;

