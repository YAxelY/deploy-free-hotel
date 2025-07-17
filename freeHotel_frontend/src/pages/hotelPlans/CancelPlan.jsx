import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar2 from '../../components/navbar2/navbar2.jsx';
import Sidebar from '../../components/sidebar/sidebar.jsx';

const REASONS = [
    'Too expensive',
    'No longer need the hotel',
    'Switching to another provider',
    'Dissatisfied with features',
    'Other',
];

export default function CancelPlan() {
    const location = useLocation();
    const navigate = useNavigate();
    const hotelId = location.state?.hotelId;
    const hotelName = location.state?.hotelName;
    const [reason, setReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [info, setInfo] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/payment/cancel_plan/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify({
                    hotel_id: hotelId,
                    reason: reason === 'Other' ? otherReason : reason,
                    info,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            setSuccess('Plan cancelled and hotel deleted.');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError('Failed to cancel plan: ' + (err.message || 'Unknown error'));
        }
        setLoading(false);
    };

    if (!hotelId) return <div>No hotel selected for cancellation.</div>;

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
                <div className="cancel-plan-page" style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: 32 }}>
                    <h2>Cancel Plan for {hotelName || 'Hotel'}</h2>
                    <div style={{ color: 'red', fontWeight: 600, marginBottom: 16 }}>
                        Warning: Cancelling your plan will <b>delete your hotel and all related data</b> (rooms, reservations, payments, etc). This action cannot be undone.
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 16 }}>
                            <label>Reason for cancellation:</label>
                            <select value={reason} onChange={e => setReason(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, marginTop: 4 }}>
                                <option value="">-- Select Reason --</option>
                                {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        {reason === 'Other' && (
                            <div style={{ marginBottom: 16 }}>
                                <label>Other reason:</label>
                                <input type="text" value={otherReason} onChange={e => setOtherReason(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, marginTop: 4 }} required />
                            </div>
                        )}
                        <div style={{ marginBottom: 16 }}>
                            <label>Additional info (optional):</label>
                            <textarea value={info} onChange={e => setInfo(e.target.value)} rows={3} style={{ width: '100%', borderRadius: 6, marginTop: 4 }} />
                        </div>
                        <button className="btn cancel-btn" type="submit" disabled={loading}>Submit Cancellation</button>
                    </form>
                    {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
                    {success && <div style={{ color: 'green', marginTop: 16 }}>{success}</div>}
                    {/* Confirmation Dialog */}
                    {confirmOpen && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ maxWidth: 400 }}>
                                <h3>Confirm Cancellation</h3>
                                <div style={{ color: 'red', marginBottom: 16 }}>
                                    Are you sure you want to cancel your plan and delete your hotel? <b>This action cannot be undone.</b>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button className="btn" onClick={handleConfirm} disabled={loading}>Yes, Cancel Plan & Delete Hotel</button>
                                    <button className="btn" onClick={() => setConfirmOpen(false)} disabled={loading}>No, Go Back</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 