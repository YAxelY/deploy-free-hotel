import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersonalizedRoomRecommendations } from '../../services/recommendationApi';
import Navbar from '../../components/navbar/navbar.jsx';
import Footer from '../../components/footer/footer.jsx';
import RoomRecommendationCard from '../../components/RoomRecommendationCard.jsx';

export default function PersonalizedRecommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchRecommendations() {
            setLoading(true);
            try {
                const res = await getPersonalizedRoomRecommendations();
                setRecommendations(Array.isArray(res) ? res : []);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            }
            setLoading(false);
        }
        fetchRecommendations();
    }, []);

    const handleBookNow = (roomId, hotelId) => {
        navigate(`/booking/${hotelId}?room=${roomId}`);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Navbar />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 0' }}>
                <h2 className="section-header" style={{ marginBottom: 24 }}>
                    Personalized Room Recommendations
                </h2>
                {loading ? (
                    <div>Loading recommendations...</div>
                ) : recommendations.length === 0 ? (
                    <div>
                        <p>No personalized recommendations found.</p>
                        <p>Try searching for rooms to get personalized recommendations.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {recommendations.map((rec) => {
                            const { hotel, room } = rec;
                            const t = hotel.template_data || {};
                            const thumb = t.socialThumb || t.fields?.bgImage;
                            const title = t.socialTitle || t.fields?.title || hotel.name;
                            const hotelLocation = t.footerLocation || hotel.location || 'Unknown';
                            return (
                                <RoomRecommendationCard
                                    key={room.id}
                                    room={{
                                        image: thumb,
                                        name: room.name || room.room_type,
                                        type: room.room_type,
                                        hotelName: title,
                                        location: hotelLocation,
                                        price: room.price_per_night || room.price,
                                        rating: hotel.rating || t.rating || null,
                                        recommended: true,
                                        websiteUrl: `/website/preview/${hotel.id}`,
                                    }}
                                    onBookNow={() => handleBookNow(room.id, hotel.id)}
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
