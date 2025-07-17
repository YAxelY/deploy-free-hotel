import React from 'react';
import './HotelRecommendationCard.css';

export default function HotelRecommendationCard({ hotel, onViewWebsite }) {
    const {
        image,
        name,
        location,
        rating,
        price,
        popular,
        websiteUrl,
    } = hotel;

    return (
        <div className={`hotel-rec-card${popular ? ' popular' : ''}`}>
            {popular && <div className="badge-popular">Popular choice</div>}
            <img
                src={image}
                alt={name}
                className="hotel-rec-image"
                onError={e => { e.target.onerror = null; e.target.src = '/default-hotel.jpg'; }}
            />
            <div className="hotel-rec-content">
                <div className="hotel-rec-title">{name}</div>
                <div className="hotel-rec-location">{location}</div>
                <div className="hotel-rec-meta">
                    {rating && <span className="hotel-rec-rating">★ {rating}</span>}
                    {price && <span className="hotel-rec-price">${price} Avg.</span>}
                </div>
                <button className="hotel-rec-btn" onClick={onViewWebsite}>
                    View Website
                </button>
            </div>
        </div>
    );
} 