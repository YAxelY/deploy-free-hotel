import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import DashboardIcon from '@mui/icons-material/Dashboard';

import './sidebar.css';

function Sidebar({ isExpanded, toggleSidebar, isMobile }) {
    // Logout logic with confirmation
    const handleLogout = (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            window.location.href = '/';
        }
    };

    return (
        <div className={`aside ${isMobile ? 'mobile' : 'desktop'}`}>

            <div class="container">
                <aside className={`sidebar-component ${isExpanded ? 'expanded' : 'collapsed'}`} >
                    <div class="top">
                        <div class="logo">
                            <FontAwesomeIcon icon={['fas', 'fa-hotel']} />
                            {isExpanded && (!isMobile || (isMobile && isExpanded)) && <span>FreeHotel</span>}
                        </div>
                        <div className="toggle-btn" id="toggle-btn" onClick={toggleSidebar}>
                            <FontAwesomeIcon icon={['fas', isExpanded ? 'fa-angle-left' : 'fa-angle-right']} title={isExpanded ? 'Hide Sidebar' : 'Show Sidebar'} />
                        </div>
                    </div>

                    <div class="sidebar">
                        <ul id="side-links" class="side-links">
                            <li class="side-list">
                                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
                                    <span><DashboardIcon /></span>
                                    {isExpanded && <h3>Dashboard</h3>}
                                </NavLink>
                            </li>
                            <li class="side-list">
                                <NavLink to="/website" className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
                                    <span><FontAwesomeIcon icon={['fas', 'fa-globe']} /></span>
                                    {isExpanded && <h3>Website</h3>}
                                </NavLink>
                            </li>
                            <li class="side-list">
                                <NavLink to="/roomsTable" className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
                                    <span><FontAwesomeIcon icon={['fas', 'fa-bed']} /></span>
                                    {isExpanded && <h3>Rooms</h3>}
                                </NavLink>
                            </li>
                            <li class="side-list">
                                <NavLink to="/reservations" className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
                                    <span><FontAwesomeIcon icon={['fas', 'fa-calendar-check']} /></span>
                                    {isExpanded && <h3>Reservations</h3>}
                                </NavLink>
                            </li>
                            <li className="side-list">
                                <NavLink to="/hotelSubscriptions" className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
                                    <span><FontAwesomeIcon icon={['fas', 'fa-credit-card']} /></span>
                                    {isExpanded && <h3>Subscriptions</h3>}
                                </NavLink>
                            </li>
                            <li className="side-list">
                                <NavLink to="/hotelPlans" className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
                                    <span><FontAwesomeIcon icon={['fas', 'fa-crown']} /></span>
                                    {isExpanded && <h3>Plans</h3>}
                                </NavLink>
                            </li>
                            <li class="side-list bottom" id="settings">
                                <NavLink to="/" className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
                                    <span><FontAwesomeIcon icon={['fas', 'fa-home']} /></span>
                                    {isExpanded && <h3>Back to Home</h3>}
                                </NavLink>
                            </li>
                            <li class="side-list bottom" id="log-out">
                                <a href="#" className="side-link" onClick={handleLogout}>
                                    <span id="log-out"><FontAwesomeIcon icon={['fas', 'fa-sign-out-alt']} /></span>
                                    {isExpanded && <h3 id="log-out">Log Out</h3>}
                                </a>
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>

        </div>
    )
}

export default Sidebar;
