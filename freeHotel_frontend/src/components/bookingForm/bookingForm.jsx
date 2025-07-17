import React, { useState, useRef, useEffect } from 'react';
import './bookingForm.css';

// Cameroon towns list (copied from templateEditor.jsx)
export const cameroonTowns = [
    'Abong-Mbang', 'Akonolinga', 'Bagante', 'Bafia', 'Bafang', 'Bafoussam', 'Bamenda', 'Bandjoun', 'Batouri', 'Banyo', 'Bertoua', 'Buea', 'Djoum', 'Dibombari', 'Douala', 'Dschang', 'Ebolowa', 'Ekondo Titi', 'Figuil', 'Foumban', 'Fundong', 'Garoua', 'Guider', 'Kaele', 'Kribi', 'Kumba', 'Kumbo', 'Kousseri', 'Limbe', 'Maan', 'Mamfe', 'Manjo', 'Maroua', 'Mbanga', 'Mbengwi', 'Mbouda', 'Meiganga', 'Mokolo', 'Moloundou', 'Monatele', 'Mora', 'Ndop', 'Ngaoundere', 'Nkongsamba', 'Obala', 'Pitoa', 'Poli', 'Sangmelima', 'Tignere', 'Tibati', 'Tiko', 'Wum', 'Yaounde', 'Yagoua', 'Yokadouma', 'Other'
];

function BookingForm({ onSubmit = () => { }, initialValues = {} }) {
    // Form state
    const [location, setLocation] = useState(initialValues.location || '');
    const [showLocationOptions, setShowLocationOptions] = useState(false);
    const [checkIn, setCheckIn] = useState(initialValues.checkIn || '');
    const [checkOut, setCheckOut] = useState(initialValues.checkOut || '');
    const [adults, setAdults] = useState(initialValues.adults || 2);
    const [children, setChildren] = useState(initialValues.children || 0);
    const [rooms, setRooms] = useState(initialValues.rooms || 1);
    const [showGuests, setShowGuests] = useState(false);
    const locationInputRef = useRef(null);
    const guestsDropdownRef = useRef(null);
    const guestsSummaryRef = useRef(null);

    // Filter towns as user types
    const filteredTowns = location
        ? cameroonTowns.filter(town => town.toLowerCase().includes(location.toLowerCase()))
        : cameroonTowns;

    // Handle location select
    const handleLocationSelect = (town) => {
        setLocation(town);
        setShowLocationOptions(false);
        locationInputRef.current && locationInputRef.current.blur();
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ location, checkIn, checkOut, adults, children, rooms });
    };

    // Guests/Rooms summary
    const guestsSummary = `${adults + children} Guest${adults + children !== 1 ? 's' : ''}, ${rooms} Room${rooms !== 1 ? 's' : ''}`;

    // Close guests dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                guestsDropdownRef.current &&
                !guestsDropdownRef.current.contains(e.target) &&
                guestsSummaryRef.current &&
                !guestsSummaryRef.current.contains(e.target)
            ) {
                setShowGuests(false);
            }
        }
        if (showGuests) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showGuests]);

    return (
        <div className="booking-container">
            <form className="booking-form" onSubmit={handleSubmit} autoComplete="off">
                {/* Location input */}
                <div className="form-group">
                    <div className="input-group" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={location}
                            onChange={e => { setLocation(e.target.value); setShowLocationOptions(true); }}
                            onFocus={() => setShowLocationOptions(true)}
                            onBlur={() => setTimeout(() => setShowLocationOptions(false), 150)}
                            placeholder="Where to?"
                            ref={locationInputRef}
                            autoComplete="off"
                        />
                        <label>Location</label>
                        {showLocationOptions && (
                            <ul className="location-options">
                                {filteredTowns.length > 0 ? (
                                    filteredTowns.map((town, idx) => (
                                        <li key={idx} onMouseDown={() => handleLocationSelect(town)}>{town}</li>
                                    ))
                                ) : (
                                    <li className="no-options">No towns found</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
                {/* Check-in/out */}
                <div className="form-group">
                    <div className="input-group">
                        <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                        <label>Check In</label>
                    </div>
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                        <label>Check Out</label>
                    </div>
                </div>
                {/* Guests and Rooms */}
                <div className="form-group guests-group">
                    <div className="input-group guests-input-group">
                        <div
                            className="guests-summary-input"
                            tabIndex={0}
                            onClick={() => setShowGuests(v => !v)}
                            ref={guestsSummaryRef}
                        >
                            {guestsSummary}
                        </div>
                        <label>Guests and Rooms</label>
                        {showGuests && (
                            <div className="guests-dropdown" ref={guestsDropdownRef}>
                                <div className="guests-row">
                                    <span>Adults</span>
                                    <div className="guests-controls">
                                        <button type="button" onClick={e => { e.preventDefault(); setAdults(a => Math.max(1, a - 1)); }} className="guests-btn">-</button>
                                        <span>{adults}</span>
                                        <button type="button" onClick={e => { e.preventDefault(); setAdults(a => a + 1); }} className="guests-btn">+</button>
                                    </div>
                                </div>
                                <div className="guests-row">
                                    <span>Children</span>
                                    <div className="guests-controls">
                                        <button type="button" onClick={e => { e.preventDefault(); setChildren(c => Math.max(0, c - 1)); }} className="guests-btn">-</button>
                                        <span>{children}</span>
                                        <button type="button" onClick={e => { e.preventDefault(); setChildren(c => c + 1); }} className="guests-btn">+</button>
                                    </div>
                                </div>
                                <div className="guests-row">
                                    <span>Rooms</span>
                                    <div className="guests-controls">
                                        <button type="button" onClick={e => { e.preventDefault(); setRooms(r => Math.max(1, r - 1)); }} className="guests-btn">-</button>
                                        <span>{rooms}</span>
                                        <button type="button" onClick={e => { e.preventDefault(); setRooms(r => r + 1); }} className="guests-btn">+</button>
                                    </div>
                                </div>
                                {/* You can add more options here if needed */}
                            </div>
                        )}
                    </div>
                </div>
                <button type="submit" className="btn">Find Rooms</button>
            </form>
        </div>
    );
}

export default BookingForm;
