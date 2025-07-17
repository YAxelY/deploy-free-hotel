import React from 'react';
import './RoomRecommendationCard.css';

export default function RoomRecommendationCard({ room, onBookNow, onViewWebsite }) {
    const {
        image,
        name,
        type,
        hotelName,
        location,
        price,
        rating,
        recommended,
        websiteUrl,
    } = room;

    return (
        <div className={`room-rec-card${recommended ? ' recommended' : ''}`}>
            {recommended && <div className="badge-recommended">Recommended</div>}
            <img
                src={image}
                alt={name || type}
                className="room-rec-image"
                onError={e => { e.target.onerror = null; e.target.src = '/default-room.jpg'; }}
            />
            <div className="room-rec-content">
                <div className="room-rec-title">{name || type}</div>
                <div className="room-rec-hotel">{hotelName}</div>
                <div className="room-rec-location">{location}</div>
                <div className="room-rec-meta">
                    {rating && <span className="room-rec-rating">★ {rating}</span>}
                    {price && <span className="room-rec-price">${price}/night</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={onBookNow}>
                        Book Now
                    </button>
                    {onViewWebsite && (
                        <button className="room-rec-btn-alt" onClick={onViewWebsite}>
                            View Website
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 