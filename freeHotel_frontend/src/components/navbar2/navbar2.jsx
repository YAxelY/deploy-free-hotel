import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import profile1 from '../../assets/images/profile1.jpg'
import './navbar2.css'

function Navbar2(){
    return (
        <div id="navbar2">
            <nav class="navbar2">
                <form action="/">
                    <div class="form-input">
                        <input type="search" placeholder="Search..." />
                        <button type="submit" class="search-btn">
                            <FontAwesomeIcon icon={['fas','fa-search']} />
                        </button>
                    </div>
                </form>
                <input type="checkbox" id="switch-mode" hidden />
                <label for="switch-mode" class="switch-mode"></label>
                <Link to="/" class="notification">
                    <span><FontAwesomeIcon icon={['fas','fa-bell']} /></span>
                    <span class="num">8</span>
                </Link>
                <Link to="/" class="profile">
                    <img src={profile1} alt="" />
                </Link>
            </nav>
        </div>
    )

}

export default Navbar2;