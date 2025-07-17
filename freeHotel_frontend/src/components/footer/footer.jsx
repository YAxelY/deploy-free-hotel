import { useEffect } from 'react';
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './footer.css'

import React from "react";

function Footer(){
    

    return(
        <div>
            <footer class="footer" id="contact">
                <div class="section-container footer-container">
                    <div class="footer-col">
                        <div class="logo">
                            <a href="#home" class="nav-link">
                                <span><FontAwesomeIcon icon={['fas', 'fa-home']} /></span><h4>FreeHotel</h4>
                            </a>
                        </div>
                        <p class="section-description">
                            Discover your perfect stay with our hotel booking website! Easily browse, compare, and 
                            book hotels based on location, price, and amenities. With real-time availability and secure 
                            payment options, planning your next getaway has never been easier. Book now and enjoy 
                            a seamless travel experience!
                        </p>
                        <Link to="/rooms" class="btn">Book Now</Link>
                    </div>
                    <div class="footer-col">
                        <h4>QUICK LINKS</h4>
                        <ul class="footer-links">
                            <li><a href="#" class="nav-link">Browse Destinations</a></li>
                            <li><a href="#" class="nav-link">Special Offers & Packages</a></li>
                            <li><a href="#" class="nav-link">Hotel Types & Amenities</a></li>
                            <li><a href="#" class="nav-link">Customer Reviews & Ratings</a></li>
                            <li><a href="#" class="nav-link">Travel Tips & Guides</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>OUR SERVICES</h4>
                        <ul class="footer-links">
                            <li><a href="#" class="nav-link">Concierge Assistance</a></li>
                            <li><a href="#" class="nav-link">Flexible Booking Operations</a></li>
                            <li><a href="#" class="nav-link">Airport Transfers</a></li>
                            <li><a href="#" class="nav-link">Wellness And Recreation</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h4>CONTACT US</h4>
                        <ul class="footer-links">
                            <li><a href="#" class="nav-link">nexastay@info.com</a></li>
                        </ul>
                        <div class="footer-socials">
                        <a href="#">
                            <FontAwesomeIcon icon={['fab', 'fa-facebook-f']} />
                        </a>
                        <a href="#">
                            <FontAwesomeIcon icon={['fab', 'fa-instagram']} />
                        </a>
                        <a href="#">
                            <FontAwesomeIcon icon={['fab', 'fa-twitter']} />
                        </a>
                        <a href="#">
                            <FontAwesomeIcon icon={['fab', 'fa-youtube']} />
                        </a>
                        </div>
                    </div>
                </div>
                <div class="footer-bar">
                    Copyright &copy; 2025 Team <span>Nexa Stay</span>. All Rights Reserved.
                </div>
            </footer>
        </div>
    )
}

export default Footer;