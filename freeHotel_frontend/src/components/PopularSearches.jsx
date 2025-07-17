import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicHotels } from '../services/hotelApi';

const cameroonTowns = [
    'Abong-Mbang', 'Akonolinga', 'Bagante', 'Bafia', 'Bafang', 'Bafoussam', 'Bamenda', 'Bandjoun', 'Batouri', 'Banyo', 'Bertoua', 'Buea', 'Djoum', 'Dibombari', 'Douala', 'Dschang', 'Ebolowa', 'Ekondo Titi', 'Figuil', 'Foumban', 'Fundong', 'Garoua', 'Guider', 'Kaele', 'Kribi', 'Kumba', 'Kumbo', 'Kousseri', 'Limbe', 'Maan', 'Mamfe', 'Manjo', 'Maroua', 'Mbanga', 'Mbengwi', 'Mbouda', 'Meiganga', 'Mokolo', 'Moloundou', 'Monatele', 'Mora', 'Ndop', 'Ngaoundere', 'Nkongsamba', 'Obala', 'Pitoa', 'Poli', 'Sangmelima', 'Tignere', 'Tibati', 'Tiko', 'Wum', 'Yaounde', 'Yagoua', 'Yokadouma', 'Other'
];

// Custom images for some Cameroon cities (add more as needed)
const cameroonCityImages = {
    'Yaounde': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'Douala': 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    'Dschang': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    // Add more city images here
};
const defaultCameroonImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';
const defaultOtherImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';

export default function PopularSearches() {
    const [cameroonCards, setCameroonCards] = useState([]);
    const [otherCards, setOtherCards] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchCities() {
            const res = await getPublicHotels();
            const hotels = res.results || [];
            // Group hotels by normalized location
            const cityMap = {};
            hotels.forEach(hotel => {
                const loc = (hotel.location || '').trim();
                if (!loc) return;
                const normLoc = loc.toLowerCase();
                if (!cityMap[normLoc]) cityMap[normLoc] = { hotels: [], displayName: loc, avgPrice: 0 };
                cityMap[normLoc].hotels.push(hotel);
            });
            
            // Calculate avg price for each city
            Object.keys(cityMap).forEach(normLoc => {
                const allPrices = cityMap[normLoc].hotels.flatMap(h => {
                    const t = h.template_data || {};
                    if (Array.isArray(t.rooms)) {
                        return t.rooms.map(r => Number(r.price_per_night)).filter(p => !isNaN(p));
                    }
                    return [];
                });
                cityMap[normLoc].avgPrice = allPrices.length > 0 ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length) : 0;
            });
            
            // Debug: Log all locations from hotels
            console.log('All hotel locations:', Object.keys(cityMap).map(k => `${k} (${cityMap[k].displayName})`));
            
            // Normalize city names for comparison
            const normalizedCameroonTowns = cameroonTowns.map(town => town.toLowerCase());
            console.log('Cameroon towns:', cameroonTowns);
            
            // Only show cities that have hotels
            const allCities = Object.keys(cityMap)
                .filter(normLoc => {
                    const hasHotels = cityMap[normLoc].hotels.length > 0;
                    if (!hasHotels) return false;
                    
                    const displayName = cityMap[normLoc].displayName;
                    const isCameroon = normalizedCameroonTowns.includes(displayName.toLowerCase());
                    console.log(`City: ${displayName}, isCameroon: ${isCameroon}`);
                    return true;
                })
                .map(normLoc => {
                    const displayName = cityMap[normLoc].displayName;
                    const isCameroon = normalizedCameroonTowns.includes(displayName.toLowerCase());
                    const cityName = isCameroon 
                        ? cameroonTowns.find(t => t.toLowerCase() === displayName.toLowerCase()) || displayName
                        : displayName;
                    
                    console.log(`Processing city: ${displayName} -> ${cityName} (isCameroon: ${isCameroon})`);
                        
                    return {
                        name: cityName,
                        image: cameroonCityImages[cityName] || (isCameroon ? defaultCameroonImage : defaultOtherImage),
                        hotels: cityMap[normLoc].hotels.length,
                        avgPrice: cityMap[normLoc].avgPrice,
                        isCameroon
                    };
                })
                .sort((a, b) => b.hotels - a.hotels); // Sort by number of hotels
                
            console.log('All cities with hotels:', allCities);
            
            // Separate into Cameroon and other cities
            const cameroonCities = allCities.filter(c => c.isCameroon);
            const otherCities = allCities.filter(c => !c.isCameroon);
            
            // Create cards
            const cameroonCards = cameroonCities.map(city => ({
                name: city.name,
                image: city.image,
                hotels: city.hotels,
                avgPrice: city.avgPrice
            }));
            
            const otherCards = otherCities.map(city => ({
                name: city.name,
                image: city.image,
                hotels: city.hotels,
                avgPrice: city.avgPrice
            }));
            
            setCameroonCards(cameroonCards);
            setOtherCards(otherCards);
        }
        fetchCities();
        
        // Error handling for the effect
        return () => {
            // Cleanup if needed
        };
    }, []);

    return (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 0' }}>
            <h2 className="section-header" style={{ marginBottom: 16 }}>Popular searches</h2>
            {cameroonCards.length > 0 && (
                <>
                    <h3 style={{ fontWeight: 700, fontSize: '1.2rem', margin: '1.5rem 0 0.5rem 0' }}>Cities in Cameroon</h3>
                    <div style={{ display: 'flex', gap: 32, overflowX: 'auto', paddingBottom: 8 }}>
                        {cameroonCards.map(city => (
                            <div
                                key={city.name}
                                style={{
                                    minWidth: 260,
                                    background: '#fff',
                                    borderRadius: 18,
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                }}
                                onClick={() => navigate(`/recommendations/location/${encodeURIComponent(city.name)}`)}
                            >
                                <img src={city.image} alt={city.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                                <div style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 8 }}>{city.name}</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#222' }}>{city.hotels.toLocaleString()} <span style={{ fontWeight: 400, fontSize: '1rem', color: '#444' }}>Hotels</span></div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#222' }}>${city.avgPrice} <span style={{ fontWeight: 400, fontSize: '1rem', color: '#444' }}>Avg.</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            {otherCards.length > 0 && (
                <>
                    <h3 style={{ fontWeight: 700, fontSize: '1.2rem', margin: '2.5rem 0 0.5rem 0' }}>Cities in Other Countries</h3>
                    <div style={{ display: 'flex', gap: 32, overflowX: 'auto', paddingBottom: 8 }}>
                        {otherCards.map(city => (
                            <div
                                key={city.name}
                                style={{
                                    minWidth: 260,
                                    background: '#fff',
                                    borderRadius: 18,
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                }}
                                onClick={() => navigate(`/recommendations/location/${encodeURIComponent(city.name)}`)}
                            >
                                <img src={city.image} alt={city.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                                <div style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 8 }}>{city.name}</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#222' }}>{city.hotels.toLocaleString()} <span style={{ fontWeight: 400, fontSize: '1rem', color: '#444' }}>Hotels</span></div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#222' }}>${city.avgPrice} <span style={{ fontWeight: 400, fontSize: '1rem', color: '#444' }}>Avg.</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
} 