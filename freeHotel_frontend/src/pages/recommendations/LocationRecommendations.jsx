import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLocationHotelRecommendations } from '../../services/recommendationApi';
import Navbar from '../../components/navbar/navbar.jsx';
import Footer from '../../components/footer/footer.jsx';
import outside1 from '../../assets/images/outside1.jpg';
import HotelRecommendationCard from '../../components/HotelRecommendationCard.jsx';

export default function LocationRecommendations() {
    const { location } = useParams();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchHotels() {
            setLoading(true);
            const res = await getLocationHotelRecommendations(location);
            setHotels(Array.isArray(res) ? res : []);
            setLoading(false);
        }
        fetchHotels();
    }, [location]);

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Navbar />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 0' }}>
                <h2 className="section-header" style={{ marginBottom: 24 }}>
                    Hotels in {location}
                </h2>
                {loading ? (
                    <div>Loading hotels...</div>
                ) : hotels.length === 0 ? (
                    <div>No hotels found for this location.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {hotels.map(hotel => {
                            const t = hotel.template_data || {};
                            const thumb = t.socialThumb || t.fields?.bgImage || outside1;
                            const title = t.socialTitle || t.fields?.title || hotel.name;
                            const hotelLocation = t.footerLocation || hotel.location || 'Unknown';
                            const rating = hotel.rating || t.rating || null;
                            const price = t.rooms && t.rooms.length > 0 ? Math.min(...t.rooms.map(r => r.price || r.price_per_night || 0)) : null;
                            return (
                                <HotelRecommendationCard
                                    key={hotel.id}
                                    hotel={{
                                        image: thumb,
                                        name: title,
                                        location: hotelLocation,
                                        rating,
                                        price,
                                        popular: hotel.popular || false,
                                        websiteUrl: `/website/preview/${hotel.id}`,
                                    }}
                                    onViewWebsite={() => navigate(`/website/preview/${hotel.id}`)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
} 