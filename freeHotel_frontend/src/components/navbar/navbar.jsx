import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './navbar.css'

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    }

    const closeMenu = () => {
        setIsOpen(false);
    }

    const logout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            window.location.href = '/';
        }
    };

    return (
        <div class="head">
            <nav>
                <div class="navbar">
                    <div class="logo">
                        {/* <FontAwesomeIcon icon={['fas', 'fa-hotel']} />
                        <span>FreeHotel</span> */}
                        <img src="/FH-full.jpg" alt="logo" />
                    </div>
                    <div class="menu-bar" id="menu-bar" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={isOpen ? ['fas', 'fa-times'] : ['fas', 'fa-bars']} />
                    </div>
                </div>

                <ul id="nav-links" class={`nav-links ${isOpen ? 'open' : ''}`} onClick={closeMenu}>
                    <li class="link"><Link to="/" class="nav-link">Home</Link></li>
                    <li class="link"><Link to="/rooms" class="nav-link">Find Rooms</Link></li>
                    {isLoggedIn && userRole === 'ADMIN' && <li class="link"><Link to="/dashboard" class="nav-link">Dashboard</Link></li>}
                    {!isLoggedIn && <li class="link"><Link to="/login" class="nav-link">Login</Link></li>}
                    {!isLoggedIn && <li class="link"><Link to="/signUp" class="nav-link">Sign Up</Link></li>}
                    {isLoggedIn && <li class="link"><button class="btn" onClick={logout}>
                        <FontAwesomeIcon icon={['fas', 'fa-right-from-bracket']} />
                        Log out
                    </button></li>}
                </ul>
            </nav>
        </div>
    )
}

export default Navbar;