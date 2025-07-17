import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/navbar.jsx';
import BookingForm from '../../components/bookingForm/bookingForm.jsx';
import Footer from '../../components/footer/footer.jsx';
import { getPublicHotels } from '../../services/hotelApi';
import './rooms.css';
import defaultRoomImage from '../../assets/images/bedroom9.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createReservation } from '../../services/reservationApi';
import ReservationModal from '../../components/ReservationModal.jsx';
import { cameroonTowns } from '../../components/bookingForm/bookingForm.jsx';
import RoomRecommendationCard from '../../components/RoomRecommendationCard.jsx';
import { getPersonalizedRoomRecommendations, getPopularRoomRecommendations } from '../../services/recommendationApi';

function Rooms() {
  const [roomCards, setRoomCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({});
  const [priceFilter, setPriceFilter] = useState('all');
  const [roomRecs, setRoomRecs] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const locationObj = useLocation();
  const navigate = useNavigate();
  const [reservationModal, setReservationModal] = useState({ open: false, room: null });
  const [reservedRoomIds, setReservedRoomIds] = useState([]);

  // Reservation modal state
  const [reservationForm, setReservationForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    client_name: '',
    client_email: '',
    client_phone: '',
  });

  // Parse query params for initial filter
  useEffect(() => {
    const params = new URLSearchParams(locationObj.search);
    const location = params.get('location') || '';
    const checkIn = params.get('checkIn') || '';
    const checkOut = params.get('checkOut') || '';
    const adults = params.get('adults') || 2;
    const children = params.get('children') || 0;
    const rooms = params.get('rooms') || 1;
    setFilter({ location, checkIn, checkOut, adults: Number(adults), children: Number(children), rooms: Number(rooms) });
    setPriceFilter(params.get('price') || 'all');
  }, [locationObj.search]);

  // Fetch and merge real room data with template_data
  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      setError(null);
      try {
        const response = await getPublicHotels();
        const hotels = Array.isArray(response.results) ? response.results : [];
        const allRooms = [];

        hotels.forEach(hotel => {
          if (!hotel || typeof hotel !== 'object') return;

          // Get hotel metadata from template_data
          const amenitiesSection = hotel.template_data && Array.isArray(hotel.template_data.amenities) ? hotel.template_data.amenities : [];
          const footerLocation = hotel.template_data && hotel.template_data.footerLocation ? hotel.template_data.footerLocation : hotel.location || '';
          const templateRooms = hotel.template_data && Array.isArray(hotel.template_data.rooms) ? hotel.template_data.rooms : [];

          // Create a map of template rooms by room_number for easy lookup
          const templateRoomsMap = {};
          templateRooms.forEach(templateRoom => {
            if (templateRoom && templateRoom.roomNumber) {
              templateRoomsMap[templateRoom.roomNumber] = templateRoom;
            }
          });

          // Process real rooms from backend
          const realRooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
          realRooms.forEach(realRoom => {
            if (!realRoom || typeof realRoom !== 'object') return;

            // Find corresponding template room data
            const templateRoom = templateRoomsMap[realRoom.room_number] || {};

            // Merge real room data with template data
            const mergedRoom = {
              // Real room data (for backend operations)
              id: realRoom.id, // This is the real Room model ID
              room_number: realRoom.room_number,
              room_type: realRoom.room_type,
              price_per_night: realRoom.price_per_night,
              capacity: realRoom.capacity,
              is_available: realRoom.is_available,

              // Template data (for display)
              name: templateRoom.name || realRoom.room_type,
              desc: templateRoom.desc || '',
              type: templateRoom.type || realRoom.room_type,
              beds: templateRoom.beds || '',
              image: realRoom.image
                ? (realRoom.image.startsWith('http') ? realRoom.image : `http://localhost:8000${realRoom.image}`)
                : (templateRoom.image || defaultRoomImage),
              price: templateRoom.price || parseFloat(realRoom.price_per_night),

              // Hotel metadata
              hotelName: hotel.logo_text || hotel.name || 'Hotel',
              hotelAmenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
              hotelId: hotel.id,
              hotelDomain: hotel.domain_name || '',
              hotelAmenitiesSection: amenitiesSection,
              hotelFooterLocation: footerLocation,
            };

            allRooms.push(mergedRoom);
          });
        });

        setRoomCards(allRooms);
      } catch (err) {
        setError('Failed to load rooms. ' + (err && err.message ? err.message : ''));
        setRoomCards([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  // Fetch personalized recommendations if logged in, fallback to popular
  useEffect(() => {
    async function fetchRecs() {
      setLoadingRecs(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // If not logged in, show popular recommendations
          const popularRecs = await getPopularRoomRecommendations();
          setRoomRecs(Array.isArray(popularRecs) ? popularRecs : []);
          setLoadingRecs(false);
          return;
        }
        // Try personalized recommendations first
        try {
          const recs = await getPersonalizedRoomRecommendations(token);
          console.log('Personalized recommendations:', recs);
          if (Array.isArray(recs) && recs.length > 0) {
            setRoomRecs(recs);
          } else {
            // Fallback to popular recommendations if no personalized ones
            const popularRecs = await getPopularRoomRecommendations();
            setRoomRecs(Array.isArray(popularRecs) ? popularRecs : []);
          }
        } catch (error) {
          // Fallback to popular recommendations if personalized fails
          const popularRecs = await getPopularRoomRecommendations();
          setRoomRecs(Array.isArray(popularRecs) ? popularRecs : []);
        }
      } catch (error) {
        setRoomRecs([]);
      }
      setLoadingRecs(false);
    }
    fetchRecs();
  }, []);

  // Filtering logic
  let filteredRooms = roomCards;
  let noResults = false;
  if (filter.location && roomCards.length > 0) {
    if (filter.location.trim().toLowerCase() === 'other') {
      // Show rooms in hotels whose location is NOT in cameroonTowns
      const normalizedCameroonTowns = cameroonTowns.map(t => t.trim().toLowerCase());
      filteredRooms = roomCards.filter(room => {
        if (!room.hotelFooterLocation) return false;
        // Extract city part (before comma, if present)
        const city = room.hotelFooterLocation.split(',')[0].trim().toLowerCase();
        return !normalizedCameroonTowns.includes(city);
      });
      if (filteredRooms.length === 0) noResults = true;
    } else {
      filteredRooms = roomCards.filter(room => {
        if (!room.hotelFooterLocation) return false;
        // Match if the location (case-insensitive, partial match) is in the footerLocation
        return room.hotelFooterLocation.toLowerCase().includes(filter.location.toLowerCase());
      });
      if (filteredRooms.length === 0) noResults = true;
    }
  }
  // Price filter
  if (priceFilter !== 'all' && filteredRooms.length > 0) {
    filteredRooms = filteredRooms.filter(room => {
      const price = Number(room.price);
      if (isNaN(price)) return false;
      if (priceFilter === 'under100') return price < 100;
      if (priceFilter === '100-299') return price >= 100 && price <= 299;
      if (priceFilter === '300-499') return price >= 300 && price <= 499;
      if (priceFilter === '500plus') return price >= 500;
      return true;
    });
  }

  // Handle booking form submit on this page (no redirect)
  function handleBookingFormSubmit(formData) {
    // Update the filter and update the URL
    const params = new URLSearchParams();
    if (formData.location) params.append('location', formData.location);
    if (formData.checkIn) params.append('checkIn', formData.checkIn);
    if (formData.checkOut) params.append('checkOut', formData.checkOut);
    if (formData.adults) params.append('adults', formData.adults);
    if (formData.children) params.append('children', formData.children);
    if (formData.rooms) params.append('rooms', formData.rooms);
    navigate(`/rooms?${params.toString()}`);
    setFilter({ ...formData });
  }

  // Handle price filter change
  function handlePriceFilterChange(e) {
    setPriceFilter(e.target.value);
    // Update URL param
    const params = new URLSearchParams(locationObj.search);
    if (e.target.value === 'all') {
      params.delete('price');
    } else {
      params.set('price', e.target.value);
    }
    navigate(`/rooms?${params.toString()}`);
  }

  // Helper: check if user is logged in
  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  // Open reservation modal
  function handleBookNow(room) {
    const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : '';
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '';
    const token = localStorage.getItem('token');
    if (!token || !userName || !userEmail) {
      alert('Please log in or sign up to book a room.');
      navigate('/login');
      return;
    }
    setReservationForm({
      checkIn: filter.checkIn || '',
      checkOut: filter.checkOut || '',
      guests: (filter.adults || 1) + (filter.children || 0),
      client_name: userName,
      client_email: userEmail,
      client_phone: '',
    });
    setReservationModal({ open: true, room });
  }

  // Submit reservation
  async function handleReservationSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to reserve a room.');
      return;
    }
    const { room } = reservationModal;
    try {
      const reservation = await createReservation({
        room: room.id, // This is now the real Room model ID
        check_in: reservationForm.checkIn,
        check_out: reservationForm.checkOut,
        guests: Number(reservationForm.guests),
        price: Number(room.price_per_night || room.price),
        room_image: room.image,
        client_name: reservationForm.client_name,
        client_email: reservationForm.client_email,
        client_phone: reservationForm.client_phone,
      }, token);
      // Redirect to payment page with reservation and room info
      navigate('/payment', {
        state: {
          reservationId: reservation.id,
          amount: Number(room.price_per_night || room.price),
          client_name: reservationForm.client_name,
          client_email: reservationForm.client_email,
          room,
          returnTo: location.pathname
        }
      });
      setReservedRoomIds(ids => [...ids, room.id]);
      setReservationModal({ open: false, room: null });
    } catch (err) {
      alert('Reservation failed: ' + err.message);
    }
  }

  // Check if room is reserved (for now, just by id in reservedRoomIds)
  function isRoomReserved(room) {
    return reservedRoomIds.includes(room.id);
  }

  return (
    <div className="rooms">
      <Navbar />
      <section className="rooms-container" id="rooms">
        <div className="rooms-image-container">
          <div className="rooms-content">
            <h1>Rest - Recharge - Repeat</h1>
            <p>Book Hotels and Stay Packages at Lowest Price.</p>
          </div>
          <BookingForm onSubmit={handleBookingFormSubmit} initialValues={filter} />
        </div>
      </section>


      <main className="hotel-listings-container">
        <header className="header">
          <div className="search-filters">
            <div className="filter">Dates: {filter.checkIn || 'Check In'} - {filter.checkOut || 'Check Out'}</div>
            <div className="filter">{filter.adults || 2} adults</div>
            <div className="filter">Price</div>
            <div className="filter">Rating</div>
          </div>
        </header>

        {/* <div className="map-container">
          <div className="map-placeholder">Map View</div>
        </div> */}

        <div className="main-content">
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3>Price per night</h3>
              <select value={priceFilter} onChange={handlePriceFilterChange} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', marginBottom: 12 }}>
                <option value="all">All</option>
                <option value="under100">$100-</option>
                <option value="100-299">$100-$299</option>
                <option value="300-499">$300-$499</option>
                <option value="500plus">$500+</option>
              </select>
              {/* Price range slider would go here */}
              <div className="price-range">
                <span>$0</span>
                <span>$500+</span>
              </div>
            </div>
            {/* <div className="filter-section">
              <h3>Star rating</h3>
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="star-filter">
                  <input type="checkbox" id={`stars-${stars}`} />
                  <label htmlFor={`stars-${stars}`}>{'★'.repeat(stars)}</label>
                </div>
              ))}
            </div> */}
          </aside>

          <div className="hotels-list">
            {loading && <div>Loading rooms...</div>}
            {error && <div className="error-message" style={{ color: 'red', fontWeight: 'bold' }}>{error}</div>}
            {noResults && (
              <div className="no-results-message" style={{ color: 'orange', fontWeight: 'bold', marginBottom: 16 }}>
                No available hotels for the town mentioned. Showing all rooms below.
              </div>
            )}
            {!loading && !error && filteredRooms.length === 0 && <div>No rooms found.</div>}
            {!loading && !error && filteredRooms.map((room, idx) => (
              <div key={idx} className="hotel-card">
                <div className="hotel-image">
                  <img src={room.image && typeof room.image === 'string' ? room.image : defaultRoomImage} alt={room.name || 'Room'} onError={e => { e.target.onerror = null; e.target.src = defaultRoomImage; }} />
                </div>
                <div className="hotel-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2 style={{ margin: 0 }}>{room.name || 'Room'}</h2>
                    {room.hotelFooterLocation && (
                      <span style={{ display: 'flex', alignItems: 'center', color: '#333', fontWeight: 500, fontSize: '1rem', gap: 4 }}>
                        <FontAwesomeIcon icon={['fas', 'fa-map-marker-alt']} style={{ marginRight: 4 }} />
                        {room.hotelFooterLocation}
                      </span>
                    )}
                  </div>
                  {room.desc && <div className="room-desc">{room.desc}</div>}
                  {room.type && (
                    <div className="room-type" style={{ fontSize: '0.98rem', color: '#555', marginTop: 2 }}>
                      <strong>Type:</strong> {room.type}
                    </div>
                  )}
                  {room.beds && (
                    <div className="room-beds" style={{ fontSize: '0.98rem', color: '#555', marginTop: 2 }}>
                      <strong>Beds:</strong> {room.beds}
                    </div>
                  )}
                  <div className="hotel-amenities" style={{ marginTop: '0.5rem' }}>
                    {Array.isArray(room.hotelAmenitiesSection) && room.hotelAmenitiesSection.map((amenity, i) => (
                      <span key={i} className="amenity">{amenity.title}</span>
                    ))}
                  </div>
                  {room.hotelDomain && (
                    <div className="hotel-domain-link" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      <Link id="hotel-domain-link" to={`/website/preview/${room.hotelId}`} target="_blank" rel="noopener noreferrer">
                        {`Visit hotel website at ${room.hotelDomain}`}
                      </Link>
                    </div>
                  )}
                </div>
                <div className="hotel-pricing">
                  <div className="price">{room.price ? `$${room.price}` : 'N/A'}</div>
                  <div className="per-night">per night</div>
                  <button
                    className="btn"
                    disabled={!room.is_available}
                    onClick={() => handleBookNow(room)}
                    style={!room.is_available ? { background: '#ccc', cursor: 'not-allowed' } : {}}
                  >
                    {room.is_available ? 'Book Now' : 'Not Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>


        </div>

        {/* Recommendations Section - moved below booking form, with extra margin */}
        <section
          className="recommendations-section responsive-recommendations"
          style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 32, marginTop: '7rem' }}
        >
          <h2 className="section-header" style={{ marginBottom: 16 }}>
            {localStorage.getItem('token') ? 'Recommended for You' : 'Popular Rooms'}
          </h2>
          {loadingRecs ? (
            <div>Loading recommendations...</div>
          ) : roomRecs.length === 0 ? (
            <div style={{ color: '#888', fontSize: '1.1rem', marginBottom: 16 }}>
              {localStorage.getItem('token')
                ? 'No personalized or popular recommendations yet. Try searching or booking to get recommendations!'
                : 'No popular rooms available at the moment. Check back later!'}
            </div>
          ) : (
            <div
              className="recommendations-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
                overflowX: 'auto',
                paddingBottom: 8,
                paddingLeft: 4,
                paddingRight: 4,
                paddingTop: 10,
              }}
            >
              {roomRecs.map((room) => {
                const hotel = room.hotel;
                const t = hotel?.template_data || {};
                const thumb = t.socialThumb || t.fields?.bgImage;
                const title = t.socialTitle || t.fields?.title || hotel?.name;
                const hotelLocation = t.footerLocation || hotel?.location || 'Unknown';
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
                      rating: hotel?.rating || t.rating || null,
                      recommended: true,
                      websiteUrl: hotel ? `/website/preview/${hotel.id}` : '#',
                    }}
                    onBookNow={() => handleBookNow(room)}
                    onViewWebsite={() => hotel && navigate(`/website/preview/${hotel.id}`)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
      {/* Reservation Modal */}
      <ReservationModal
        open={reservationModal.open}
        onClose={() => setReservationModal({ open: false, room: null })}
        onSubmit={handleReservationSubmit}
        reservationForm={reservationForm}
        setReservationForm={setReservationForm}
        room={reservationModal.room}
      />
    </div>
  );
}

export default Rooms;
