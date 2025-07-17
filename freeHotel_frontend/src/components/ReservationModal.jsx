import React from 'react';

export default function ReservationModal({
    open,
    onClose,
    onSubmit,
    reservationForm,
    setReservationForm,
    room
}) {
    if (!open) return null;
    const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : '';
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '';
    const isLoggedIn = !!userName && !!userEmail;
    return (
        <div className="reservation-modal-overlay">
            <form className="reservation-modal-form" onSubmit={onSubmit}>
                <h2>Book Your Stay</h2>
                <div className="modal-fields">
                    <div className="modal-field">
                        <label>Check In</label>
                        <input type="date" value={reservationForm.checkIn} onChange={e => setReservationForm(f => ({ ...f, checkIn: e.target.value }))} required />
                    </div>
                    <div className="modal-field">
                        <label>Check Out</label>
                        <input type="date" value={reservationForm.checkOut} onChange={e => setReservationForm(f => ({ ...f, checkOut: e.target.value }))} required />
                    </div>
                    <div className="modal-field">
                        <label>Guests</label>
                        <input type="number" min={1} value={reservationForm.guests} onChange={e => setReservationForm(f => ({ ...f, guests: e.target.value }))} required />
                    </div>
                    <div className="modal-field">
                        <label>Name</label>
                        <input type="text" value={isLoggedIn ? userName : reservationForm.client_name}
                            onChange={e => setReservationForm(f => ({ ...f, client_name: e.target.value }))}
                            required
                            readOnly={isLoggedIn}
                        />
                    </div>
                    <div className="modal-field">
                        <label>Email</label>
                        <input type="email" value={isLoggedIn ? userEmail : reservationForm.client_email}
                            onChange={e => setReservationForm(f => ({ ...f, client_email: e.target.value }))}
                            required
                            readOnly={isLoggedIn}
                        />
                    </div>
                    <div className="modal-field">
                        <label>Phone</label>
                        <input type="tel" value={reservationForm.client_phone} onChange={e => setReservationForm(f => ({ ...f, client_phone: e.target.value }))} required />
                    </div>
                    <div className="modal-field">
                        <label>Price</label>
                        <input type="text" value={room?.price} disabled />
                    </div>
                </div>
                <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">Confirm Reservation</button>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    );
} 