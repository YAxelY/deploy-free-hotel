import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import outside1 from "../../assets/images/outside1.jpg"
import profile1 from "../../assets/images/profile1.jpg"
import { useEffect, useState } from 'react';
import { getPublicHotels } from '../../services/hotelApi';
import { useNavigate, Link } from 'react-router-dom';
import BookingForm from '../../components/bookingForm/bookingForm.jsx';
import PopularSearches from '../../components/PopularSearches.jsx';
import RoomRecommendationCard from '../../components/RoomRecommendationCard.jsx';
import { getPersonalizedRoomRecommendations, getPopularRoomRecommendations } from '../../services/recommendationApi';
import { getReviews, createReview, deleteReview } from '../../services/reviewApi';
import StarRating from '../../components/StarRating.jsx';
import ReservationModal from '../../components/ReservationModal.jsx';
import service1 from '../../assets/images/service1.png';
import service2 from '../../assets/images/service2.png';
import service3 from '../../assets/images/service3.png';
import service4 from '../../assets/images/service4.png';

import './home.css'

function Home() {
    const [hotels, setHotels] = useState([]);
    const [roomRecs, setRoomRecs] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const navigate = useNavigate();

    // Handle booking form submit
    function handleBookingFormSubmit({ location, checkIn, checkOut, adults, children, rooms }) {
        // Redirect to /rooms with location as query param
        const params = new URLSearchParams();
        if (location) params.append('location', location);
        if (checkIn) params.append('checkIn', checkIn);
        if (checkOut) params.append('checkOut', checkOut);
        if (adults) params.append('adults', adults);
        if (children) params.append('children', children);
        if (rooms) params.append('rooms', rooms);
        navigate(`/rooms?${params.toString()}`);
    }

    // ADD: review state
    const [reviews, setReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(true);
    const [reviewError, setReviewError] = useState('');
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');

    // Add state for photo preview and file
    const [photo, setPhoto] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    // Add state for reservation modal
    const [reservationModal, setReservationModal] = useState({ open: false, room: null });
    const [reservationForm, setReservationForm] = useState({
        checkIn: '',
        checkOut: '',
        guests: 1,
        client_name: localStorage.getItem('userName') || '',
        client_email: localStorage.getItem('userEmail') || '',
        client_phone: '',
    });

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
            checkIn: '',
            checkOut: '',
            guests: 1,
            client_name: userName,
            client_email: userEmail,
            client_phone: '',
        });
        setReservationModal({ open: true, room });
    }

    async function handleReservationSubmit(e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to reserve a room.');
            return;
        }
        const { room } = reservationModal;
        try {
            const { createReservation } = await import('../../services/reservationApi');
            const reservation = await createReservation({
                room: room.id,
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
            setReservationModal({ open: false, room: null });
        } catch (err) {
            alert('Reservation failed: ' + err.message);
        }
    }

    useEffect(() => {
        async function fetchHotels() {
            const res = await getPublicHotels();
            setHotels(res.results ? res.results.filter(h => h.status === 'published') : []);
        }
        fetchHotels();
        // Fetch personalized recommendations if logged in
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
        // Fetch reviews
        async function fetchReviews() {
            setReviewLoading(true);
            try {
                const res = await getReviews();
                setReviews(Array.isArray(res.results) ? res.results : res);
            } catch (err) {
                setReviewError('Failed to load reviews.');
            }
            setReviewLoading(false);
        }
        fetchReviews();
    }, []);

    return (
        <div>
            {/* Booking Form at the top */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 0' }}>
                <BookingForm onSubmit={handleBookingFormSubmit} />
            </div>

            {/* Recommendations Section */}
            <section
                className="recommendations-section responsive-recommendations"
                style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 32, padding: '7rem 2rem 0 2rem' }}
            >
                <h2 className="section-header" style={{ marginBottom: 24 }}>
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
                            paddingTop: 8,
                            paddingBottom: 8,
                            paddingLeft: 4,
                            paddingRight: 4,
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

            <section className="popular-container">
                <h2 className="section-header">Featured Hotels Right Now</h2>
                <div className="popular-grid">
                    {hotels.map(hotel => {
                        const t = hotel.template_data || {};
                        const thumb = t.socialThumb || t.fields?.bgImage || outside1;
                        const title = t.socialTitle || t.fields?.title || hotel.name;
                        const location = t.footerLocation || hotel.location || 'Unknown';
                        let minPrice = 'N/A';
                        if (Array.isArray(t.rooms) && t.rooms.length > 0) {
                            const prices = t.rooms
                                .map(r => {
                                    if (r.price_per_night !== undefined && !isNaN(Number(r.price_per_night))) return Number(r.price_per_night);
                                    if (r.price !== undefined && !isNaN(Number(r.price))) return Number(r.price);
                                    return null;
                                })
                                .filter(p => p !== null && !isNaN(p));
                            if (prices.length === 1) minPrice = prices[0];
                            else if (prices.length > 1) minPrice = Math.min(...prices);
                        }
                        return (
                            <div className="popular-card" key={hotel.id}>
                                <img src={thumb} alt="popular hotel" />
                                <div className="popular-content">
                                    <div className="popular-card-header">
                                        <h4>{title}</h4>
                                        <div className="rating-location">
                                            <p><b>8.5 - Excellent </b><br />(6216)</p>
                                            <p>
                                                <FontAwesomeIcon icon={['fas', 'fa-map-marker-alt']} />
                                                {location}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Hotel Owner Email */}
                                    <div style={{ fontSize: '0.95rem', color: '#666' }}>
                                        <b>Owner Email:</b> {hotel.owner_email || 'N/A'}
                                    </div>
                                    {/* Amenities section */}
                                    {Array.isArray(t.amenities) && t.amenities.length > 0 && (
                                        <div className="popular-amenities" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0' }}>
                                            {t.amenities.map((a, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 600, color: '#444', background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '2px 8px' }}>
                                                    <FontAwesomeIcon icon={["fas", a.icon?.replace('fa-', '') || 'fa-star']} style={{ color: '#0b3e66', fontSize: '0.8rem' }} />
                                                    <span>{a.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="popular-deal">
                                        <div className="details">
                                            <div className="details-head">
                                                <p>Cheapest room</p>
                                                <p>
                                                    <span><FontAwesomeIcon icon={['fas', 'fa-check']} /></span>
                                                    Free cancellation
                                                </p>
                                            </div>
                                            <div className="price-date">
                                                <p><span>{minPrice !== 'N/A' ? `$${minPrice}` : 'N/A'}</span><br />per night</p>
                                                <p><br />First 8 days after payment</p>
                                            </div>
                                        </div>
                                        <button className="btn" onClick={() => navigate(`/website/preview/${hotel.id}`)}>Visit Website</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* <section className="searches-container">
                <PopularSearches />
            </section> */}

            <ServicesSection />

            <section className="client">
                <div className="section-container client-container">
                    <h2 className="section-header">What our Clients Say</h2>
                    {/* Modern Review Form (only for authenticated users) */}
                    <div className="review-form" style={{ maxWidth: 480, margin: '0 auto 32px', background: '#fff', borderRadius: 24, boxShadow: '0 2px 16px #0001', padding: 32 }}>
                        <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 24 }}>Share Your Experience</h2>
                        {token ? (
                            <form className="review-form" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    setSubmitting(true);
                                    setReviewError('');
                                    try {
                                        const formData = new FormData();
                                        formData.append('stars', stars);
                                        formData.append('comment', comment);
                                        if (photoFile) formData.append('profile_photo', photoFile);
                                        await createReview(formData, token);
                                        // Refresh reviews
                                        const res = await getReviews();
                                        setReviews(Array.isArray(res.results) ? res.results : res);
                                        setStars(0);
                                        setComment('');
                                        setPhoto(null);
                                        setPhotoFile(null);
                                    } catch (err) {
                                        setReviewError('Failed to submit review.');
                                    }
                                    setSubmitting(false);
                                }}>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600, marginBottom: 4 }}>Your Photo (Required)</label>
                                    <input type="file" accept="image/*" required
                                        onChange={e => {
                                            if (e.target.files && e.target.files[0]) {
                                                setPhotoFile(e.target.files[0]);
                                                setPhoto(URL.createObjectURL(e.target.files[0]));
                                            } else {
                                                setPhotoFile(null);
                                                setPhoto(null);
                                            }
                                        }}
                                        style={{ padding: 8, borderRadius: 8, border: '1px solid #eee', background: '#fafbfc' }} />
                                    {photo && (
                                        <img
                                            src={photo}
                                            alt="Preview"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '50%' }}
                                        />
                                    )}
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600, marginBottom: 4 }}>Rating (Required)</label>
                                    <StarRating value={stars} onChange={setStars} showValue={true} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600, marginBottom: 4 }}>Comment (Optional)</label>
                                    <textarea value={comment} onChange={e => setComment(e.target.value)}
                                        placeholder="Share your experience..." rows={3}
                                        style={{ resize: 'vertical', borderRadius: 8, border: '1px solid #eee', padding: 12, fontSize: 16, background: '#fafbfc' }} />
                                </div>
                                <button className="btn" type="submit" disabled={submitting}
                                    style={{ width: '100%' }}>
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                                {reviewError && <span style={{ color: 'red', marginLeft: 8 }}>{reviewError}</span>}
                            </form>
                        ) : (
                            <div style={{ marginBottom: 24 }}>
                                <span>You must <a href="/login">login</a> or <a href="/signUp">register</a> to leave a review.</span>
                            </div>
                        )}
                    </div>
                    {/* Review Grid */}
                    {reviewLoading ? (
                        <div>Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div style={{ color: '#888', fontSize: '1.1rem', marginBottom: 16 }}>No reviews yet. Be the first to review!</div>
                    ) : (
                        <div className="client-grid">
                            {reviews.slice(0, 3).map((review) => (
                                <div className="client-card" key={review.id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0003', padding: 24, color: '#222' }}>
                                    {/* Card header: profile, name, date on left; stars on right */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                                        <img src={review.profile_photo || profile1} alt="review-profile" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginRight: 14 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: 17 }}>{review.username}</div>
                                            <div style={{ color: '#888', fontSize: 13 }}>{new Date(review.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="star" style={{ marginLeft: 12, minWidth: 100, textAlign: 'right' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <FontAwesomeIcon
                                                    key={i}
                                                    icon={['fas', 'fa-star']}
                                                    style={{ color: i < review.stars ? '#FFC107' : '#e0e0e0', fontSize: 18 }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p style={{ minHeight: 48, color: '#444', marginBottom: 0 }}>{review.comment}</p>
                                    <div style={{ fontSize: '0.9em', color: '#888', marginTop: 8 }}>
                                        <span>{review.email}</span>
                                    </div>
                                    {token && userEmail === review.email && (
                                        <button className="btn" style={{ marginTop: 8, background: '#e74c3c', color: '#fff' }}
                                            disabled={deleteLoading === review.id}
                                            onClick={async () => {
                                                setDeleteLoading(review.id);
                                                try {
                                                    await deleteReview(review.id, token);
                                                    setReviews(reviews.filter(r => r.id !== review.id));
                                                } catch {
                                                    alert('Failed to delete review.');
                                                }
                                                setDeleteLoading(null);
                                            }}>
                                            {deleteLoading === review.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {/* See more reviews link */}
                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                        <Link to="/review" className="btn" style={{ textDecoration: 'none' }}>See more reviews</Link>
                    </div>
                </div>
            </section>

            <FAQSection />
            <ReservationModal
                open={reservationModal.open}
                onClose={() => setReservationModal({ open: false, room: null })}
                onSubmit={handleReservationSubmit}
                reservationForm={reservationForm}
                setReservationForm={setReservationForm}
                room={reservationModal.room}
            />
        </div>
    )
}

// ServicesSection component
function ServicesSection() {
    const services = [
        {
            key: 'search',
            title: 'Search simply',
            desc: 'Easily search through millions of hotels in seconds. Find the perfect hotel for your trip with our fast and intuitive search.',
            imgAlt: 'Search illustration',
            imgSrc: service1, // Replace with your cartoon image
        },
        {
            key: 'compare',
            title: 'Compare confidently',
            desc: 'Compare hotel prices from 100s of sites at once. See prices and deals from multiple hotels and booking platforms in one place.',
            imgAlt: 'Compare illustration',
            imgSrc: service2, // Replace with your cartoon image
        },
        {
            key: 'save',
            title: 'Save big',
            desc: 'Discover a great deal to book on our partner sites. Unlock exclusive discounts and special offers for your stay.',
            imgAlt: 'Save illustration',
            imgSrc: service3, // Replace with your cartoon image
        },
        {
            key: 'website',
            title: 'Create & Manage Your Hotel Website',
            desc: 'Showcase your hotel online and manage your property with ease. Create a beautiful website, update details, and manage bookings—all in one place.',
            imgAlt: 'Website management illustration',
            imgSrc: service4, // Replace with your cartoon image
        },
    ];
    return (
        <section className="services-section" style={{ width: '100%', background: '#fff', padding: '3rem 0' }}>
            <div className="services-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '2.5rem',
                maxWidth: 1200,
                margin: '0 auto',
                alignItems: 'flex-start',
            }}>
                {services.map(service => (
                    <div key={service.key} className="service-card" style={{ textAlign: 'center', background: 'none', borderRadius: 18, padding: '2.5rem 1.5rem', height: '400px' }}>
                        {/* Replace src with your cartoon image path */}
                        <div style={{ marginBottom: 24 }}>
                            <img src={service.imgSrc} alt={service.imgAlt} style={{ width: '200px', height: '150px', objectFit: 'cover', margin: '0 auto' }} />
                        </div>
                        <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 12 }}>{service.title}</h3>
                        <p style={{ color: '#444', fontSize: '0.8rem', lineHeight: 1.5 }}>{service.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function FAQSection() {
    const faqs = [
        {
            question: 'Is it easy to book a hotel on FreeHotel?',
            answer: 'Yes! FreeHotel offers a simple and intuitive booking process. Just search, compare, and book your preferred room in a few clicks.'
        },
        {
            question: 'How do I create a hotel website as an owner?',
            answer: 'Sign up as a hotel owner, then use our website builder to create and customize your hotel’s website. You can add rooms, photos, prices, and manage reservations easily.'
        },
        {
            question: 'Can I compare prices across different hotels?',
            answer: 'Absolutely! FreeHotel lets you compare prices, amenities, and reviews across hundreds of hotels to help you find the best deal.'
        },
        {
            question: 'Are there any fees for guests or hotel owners?',
            answer: 'Guests can search and book for free. Hotel owners can list their property and use basic features for free, with optional premium upgrades available.'
        },
        {
            question: 'How do I leave a review?',
            answer: 'After your stay, log in to your account and visit the review section to share your experience and help other travelers.'
        },
        {
            question: 'Is my payment and personal information secure?',
            answer: 'Yes, FreeHotel uses industry-standard encryption and security practices to protect your data and transactions.'
        },
    ];
    const [openIndex, setOpenIndex] = useState(null);
    const toggle = idx => setOpenIndex(openIndex === idx ? null : idx);
    return (
        <section className="faq-section" style={{ width: '100%', background: '#fff', padding: '3rem 0 4rem 0', borderTop: '1px solid #eee' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1rem' }}>
                <h2 style={{ fontSize: '2.7rem', fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>Frequently Asked Questions</h2>
                <div className="faq-list">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="faq-item" style={{ borderTop: idx === 0 ? '1px solid #bbb' : 'none', borderBottom: '1px solid #bbb', padding: '0.7rem 0', marginBottom: 0 }}>
                            <button
                                className="faq-question"
                                onClick={() => toggle(idx)}
                                aria-expanded={openIndex === idx}
                                style={{
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    textAlign: 'left',
                                    fontSize: '1.45rem',
                                    fontWeight: 500,
                                    padding: '1.1rem 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    color: '#181818',
                                }}
                            >
                                <span>{faq.question}</span>
                                <span style={{ fontSize: 28, fontWeight: 300, marginLeft: 12 }}>
                                    {openIndex === idx ? '×' : '+'}
                                </span>
                            </button>
                            <div
                                className="faq-answer"
                                style={{
                                    maxHeight: openIndex === idx ? 500 : 0,
                                    overflow: 'hidden',
                                    transition: 'max-height 0.4s cubic-bezier(.4,0,.2,1)',
                                    fontSize: '1.13rem',
                                    color: '#333',
                                    padding: openIndex === idx ? '0 0 1.2rem 0' : '0',
                                    marginLeft: 2,
                                }}
                                aria-hidden={openIndex !== idx}
                            >
                                {openIndex === idx && <div>{faq.answer}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
        @media (max-width: 700px) {
          .faq-section h2 { font-size: 2rem; }
          .faq-question { font-size: 1.1rem !important; }
          .faq-answer { font-size: 1rem !important; }
        }
      `}</style>
        </section>
    );
}

export default Home;