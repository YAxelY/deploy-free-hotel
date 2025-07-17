import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Sidebar from '../../components/sidebar/sidebar.jsx'
import Navbar2 from '../../components/navbar2/navbar2.jsx';
import profile1 from '../../assets/images/profile1.jpg'
import './roomsTable.css'
import { getPublicHotels, getOwnerHotels } from '../../services/hotelApi';
import defaultRoomImage from '../../assets/images/bedroom9.jpg';

function RoomsTable() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const toggleSidebar = () => {
        setIsSidebarExpanded(prev => !prev);
    };

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) setIsSidebarExpanded(false);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        async function fetchHotels() {
            setLoading(true);
            setError(null);
            try {
                let res;
                const token = localStorage.getItem('token');
                if (token) {
                    res = await getOwnerHotels(token);
                } else {
                    res = await getPublicHotels();
                }
                setHotels(res.results ? res.results : res);
            } catch (err) {
                setError('Failed to load hotels.');
            } finally {
                setLoading(false);
            }
        }
        fetchHotels();
    }, []);

    return (
        <div className="roomsTable" id="roomsTable">
            {/* ------------------------------ SIDEBAR ------------------------------- */}
            <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} isMobile={isMobile} />
            <div
                className={`container ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}
                style={
                    {
                        marginLeft: !isMobile && isSidebarExpanded ?
                            '280px' : !isMobile && !isSidebarExpanded ?
                                '100px' : '100px', transition: 'margin-left 0.3s ease-in-out'
                    }
                }
            >
                {/* ------------------------------ MAIN SECTION ------------------------------- */}
                <main>
                    <Navbar2 />
                    <h2 className="section-header">Rooms</h2>
                    <div className="date">
                        <input type="date" />
                    </div>
                    {loading && <div>Loading hotels and rooms...</div>}
                    {error && <div style={{ color: 'red', fontWeight: 'bold' }}>{error}</div>}
                    {!loading && !error && hotels.map(hotel => {
                        const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
                        return (
                            <div className="table-data" key={hotel.id} style={{ marginBottom: 40 }}>
                                <div className="order">
                                    <div className="head">
                                        <h3>All Rooms in {hotel.name}</h3>
                                    </div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Image</th>
                                                <th>Room Number</th>
                                                <th>Type</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                                <th>Number of Beds</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rooms.length === 0 ? (
                                                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>No rooms found.</td></tr>
                                            ) : rooms.map((room, idx) => (
                                                <tr key={room.id || idx}>
                                                    <td>
                                                        <img src={room.image || defaultRoomImage} alt={room.room_number || 'Room'} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                                                    </td>
                                                    <td>{room.room_number || '-'}</td>
                                                    <td>{room.room_type || '-'}</td>
                                                    <td>{room.price_per_night ? `$${room.price_per_night}` : '-'}</td>
                                                    <td style={{ color: room.is_available ? '#28a745' : '#c00' }}>{room.is_available ? 'Available' : 'Not Available'}</td>
                                                    <td>{room.capacity || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </main>
            </div>
        </div>
    )
}

export default RoomsTable;
