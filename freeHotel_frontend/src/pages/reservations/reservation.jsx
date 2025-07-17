import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Sidebar from '../../components/sidebar/sidebar.jsx'
import Navbar2 from '../../components/navbar2/navbar2.jsx';
import profile1 from '../../assets/images/profile1.jpg'
import './reservation.css'
import { getReservations, deleteReservation } from '../../services/reservationApi';

function Reservations() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userToken = localStorage.getItem('token');

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
        async function fetchReservations() {
            setLoading(true);
            setError(null);
            try {
                const res = await getReservations(userToken);
                setReservations(Array.isArray(res) ? res : (res.results || []));
            } catch (err) {
                setError('Failed to load reservations.');
            } finally {
                setLoading(false);
            }
        }
        fetchReservations();
    }, [userToken]);

    // Group reservations by hotel ID
    const reservationsByHotel = {};
    reservations.forEach(res => {
        const hotel = res.room_details && res.room_details.hotel;
        if (!hotel || !hotel.id) return;
        const hotelId = hotel.id;
        const hotelName = hotel.name || hotel.logo_text || 'Unknown Hotel';
        if (!reservationsByHotel[hotelId]) {
            reservationsByHotel[hotelId] = {
                hotelName,
                reservations: []
            };
        }
        reservationsByHotel[hotelId].reservations.push(res);
    });

    async function handleDeleteReservation(reservationId) {
        if (!window.confirm('Are you sure you want to delete this reservation?')) return;
        try {
            await deleteReservation(reservationId, userToken);
            setReservations(reservations => reservations.filter(r => r.id !== reservationId));
        } catch (err) {
            alert('Failed to delete reservation: ' + err.message);
        }
    }

  return (
        <div className="reservation" id="reservation">
        {/* ------------------------------ SIDEBAR ------------------------------- */}
        <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} isMobile={isMobile} />
        <div 
                className={`container ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}
                style={{ marginLeft: !isMobile && isSidebarExpanded ? '280px' : '100px', transition: 'margin-left 0.3s ease-in-out' }}
        >
            {/* ------------------------------ MAIN SECTION ------------------------------- */}
            <main>
                <Navbar2 />
                    <h2 className="section-header">Reservations</h2>
                    <div className="date">
                    <input type="date" />
                </div>
                    {loading && <div>Loading reservations...</div>}
                    {error && <div style={{ color: 'red', fontWeight: 'bold' }}>{error}</div>}
                    {!loading && !error && Object.keys(reservationsByHotel).length === 0 && <div>No reservations found.</div>}
                    {!loading && !error && Object.entries(reservationsByHotel).map(([hotelId, { hotelName, reservations }]) => (
                        <section
                            className="hotel-reservation-section"
                            key={hotelId}
                            style={{
                                marginBottom: 48,
                                padding: 24,
                                borderRadius: 12,
                                background: '#fff',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                border: '1px solid #e0e6ed'
                            }}
                        >
                            <h2 style={{ marginBottom: 16, color: '#0b3e66' }}>{hotelName}</h2>
                            <div className="table-data">
                                <div className="order">
                        <table>
                            <thead>
                                <tr>
                                    <th>Reserved On</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Guests</th>
                                    <th>Room Price</th>
                                    <th>Client Name</th>
                                    <th>Client Email</th>
                                    <th>Client Phone</th>
                                    <th>Room ID</th>
                                    <th>Room Image</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                            {reservations.map(res => (
                                                <tr key={res.id}>
                                                    <td>{res.created_at ? new Date(res.created_at).toLocaleDateString() : '-'}</td>
                                                    <td>{res.check_in}</td>
                                                    <td>{res.check_out}</td>
                                                    <td>{res.guests}</td>
                                                    <td>{res.price ? `$${res.price}` : '-'}</td>
                                                    <td>{res.client_name || '-'}</td>
                                                    <td>{res.client_email || '-'}</td>
                                                    <td>{res.client_phone || '-'}</td>
                                                    <td>{res.room_details && res.room_details.room_number}</td>
                                                    <td>
                                                        {res.room_details && res.room_details.image && (
                                                            <img
                                                                src={res.room_details.image.startsWith('http') ? res.room_details.image : `http://localhost:8000${res.room_details.image}`}
                                                                alt="Room"
                                                                style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }}
                                                            />
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn"
                                                            style={{ background: '#c00', color: '#fff' }}
                                                            onClick={() => handleDeleteReservation(res.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                </tr>
                                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                        </section>
                    ))}
            </main>
        </div>
    </div>
  )
}

export default Reservations;
