import React, { useEffect, useState } from 'react';
import { getOwnerHotels } from '../../services/hotelApi';
import './hotelPlans.css';
import { useNavigate } from 'react-router-dom';
import Navbar2 from '../../components/navbar2/navbar2.jsx';
import Sidebar from '../../components/sidebar/sidebar.jsx';

export default function HotelPlans() {
    const [hotels, setHotels] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [upgradeModal, setUpgradeModal] = useState({ open: false, hotel: null, availablePlans: [] });
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();

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
                const hotelData = Array.isArray(hotelRes.results) ? hotelRes.results : hotelRes;
                const plansRes = await fetch('http://localhost:8000/api/payment/plans/', {
                    headers: { Authorization: `Token ${token}` }
                });
                const plansData = await plansRes.json();
                console.log('plansData:', plansData);
                setHotels(hotelData);
                setPlans(plansData.results);
            } catch (err) {
                setError('Failed to load plans.');
                console.error('Error loading plans:', err);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    const handleChangePlanClick = (hotel) => {
        const currentPlan = hotel.current_plan;
        // All plans except the current one
        const availablePlans = plans.filter(p => p.name !== currentPlan?.name);
        setUpgradeModal({ open: true, hotel, availablePlans });
        setSelectedPlan(null);
    };

    const handleUpgradeConfirm = () => {
        if (!selectedPlan || !upgradeModal.hotel) return;
        const currentPlan = upgradeModal.hotel.current_plan;
        // If downgrading (selected plan price < current plan price), show warning
        if (Number(selectedPlan.price) < Number(currentPlan?.price)) {
            const confirmed = window.confirm(
                'Warning: Downgrading will remove access to Pro/Business features. Do you want to continue?'
            );
            if (!confirmed) return;
        }
        navigate('/payment', {
            state: {
                plan: { ...selectedPlan, value: selectedPlan.name },
                hotelId: upgradeModal.hotel.id
            }
        });
    };

    const handleCancelClick = (hotel) => {
        navigate('/cancelPlan', { state: { hotelId: hotel.id, hotelName: hotel.name } });
    };

    if (loading) return <div>Loading plans...</div>;
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
                <div className="hotel-plans-page" style={{ padding: 32 }}>
                    <h2>Hotel Plans</h2>
                    <table className="hotel-plans-table">
                        <thead>
                            <tr>
                                <th>Hotel</th>
                                <th>Current Plan</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hotels.map(hotel => {
                                const currentPlan = hotel.current_plan;
                                const canChange = plans.some(p => p.name !== currentPlan?.name);
                                return (
                                    <tr key={hotel.id}>
                                        <td>{hotel.name}</td>
                                        <td>{currentPlan?.name || 'N/A'}</td>
                                        <td>{currentPlan?.description || 'N/A'}</td>
                                        <td>{currentPlan ? `$${currentPlan.price}` : 'N/A'}</td>
                                        <td>
                                            {canChange && (
                                                <button className="btn upgrade-btn" onClick={() => handleChangePlanClick(hotel)}>Change Plan</button>
                                            )}
                                            <button className="btn cancel-btn" style={{ marginLeft: 8 }} onClick={() => handleCancelClick(hotel)}>Cancel Plan</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {/* Upgrade Modal */}
                    {upgradeModal.open && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h3>Change Plan for {upgradeModal.hotel?.name}</h3>
                                <div style={{ marginBottom: 16 }}>
                                    <label>Select a new plan:</label>
                                    <select value={selectedPlan?.name || ''} onChange={e => setSelectedPlan(upgradeModal.availablePlans.find(p => p.name === e.target.value))}>
                                        <option value="">-- Select Plan --</option>
                                        {upgradeModal.availablePlans.map(plan => (
                                            <option key={plan.name} value={plan.name}>{plan.name} (${plan.price}) - {plan.description}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button className="btn" onClick={handleUpgradeConfirm} disabled={!selectedPlan}>Proceed to Payment</button>
                                    <button className="btn" onClick={() => setUpgradeModal({ open: false, hotel: null, availablePlans: [] })}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 