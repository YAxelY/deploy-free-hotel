import React, { useEffect, useState } from 'react';
import { getOwnerHotels } from '../../services/hotelApi';
import './hotelSubscriptions.css';
import Navbar2 from '../../components/navbar2/navbar2.jsx';
import Sidebar from '../../components/sidebar/sidebar.jsx';

export default function HotelSubscriptions() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
        async function fetchData() {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const hotelRes = await getOwnerHotels(token);
                console.log('hotelRes:', hotelRes);
                const hotelsData = Array.isArray(hotelRes.results) ? hotelRes.results : hotelRes;
                // For each hotel, fetch payment history
                const hotelsWithSubs = await Promise.all(hotelsData.map(async (hotel) => {
                    const res = await fetch(`http://localhost:8000/api/payment/history/?hotel_id=${hotel.id}`, {
                        headers: { Authorization: `Token ${token}` }
                    });
                    const payments = await res.json();
                    console.log(`payments for hotel ${hotel.id}:`, payments);
                    // Group by month (YYYY-MM)
                    const grouped = {};
                    if (payments && payments.results) {
                        payments.results.forEach(p => {
                            const month = p.created_at ? p.created_at.slice(0, 7) : 'Unknown';
                            if (!grouped[month]) grouped[month] = [];
                            grouped[month].push(p);
                        });
                    }
                    // For each month, show the latest payment
                    const subscriptions = Object.entries(grouped).map(([month, arr]) => {
                        const latest = arr.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
                        return {
                            month,
                            amount: latest.amount,
                            status: latest.status,
                            date: latest.created_at ? latest.created_at.slice(0, 10) : '',
                        };
                    });
                    return { ...hotel, subscriptions };
                }));
                console.log('hotelsWithSubs:', hotelsWithSubs);
                setHotels(hotelsWithSubs);
            } catch (err) {
                setError('Failed to load subscriptions.');
                console.error('Error loading subscriptions:', err);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) return <div>Loading subscriptions...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="dashboard" id="content">
            <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} isMobile={isMobile} />
            <div className={`container ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}
                style={{
                    marginLeft: !isMobile && isSidebarExpanded ? '280px' : '100px',
                    transition: 'margin-left 0.3s ease-in-out'
                }}
            >
                <Navbar2 />
                <div className="hotel-subscriptions-page" style={{ padding: 32 }}>
                    <h2 className="hotel-subscriptions-title">Hotel Subscriptions</h2>
                    {hotels.map(hotel => (
                        <div key={hotel.id} className="hotel-sub-card">
                            <div className="hotel-name-row">{hotel.name}</div>
                            <table className="hotel-sub-table">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date Paid</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hotel.subscriptions.map((sub, idx) => (
                                        <tr key={idx}>
                                            <td>{sub.month}</td>
                                            <td>${sub.amount}</td>
                                            <td>{sub.status}</td>
                                            <td>{sub.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 