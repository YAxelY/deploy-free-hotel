import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReservationModal from './ReservationModal.jsx';
import { createReservation } from '../services/reservationApi';
import { useNavigate } from 'react-router-dom';


export default function HotelWebsitePreview({
  fields = {},
  bgType = 'color',
  bgImage = '',
  bgBrightness = 1,
  buttonHoverBg = '#ffe066',
  buttonHoverText = '#0b3e66',
  navbarPadding = 24,
  heroPadding = 32,
  aboutTitle = 'THE PERFECT GETAWAY',
  aboutParagraph = 'Create Lasting Memories with Your Loved Ones, Your Family Paradise Found.',
  aboutImage = null,
  aboutBgColor = '#e9f0f7',
  aboutPadding = 32,
  aboutLayout = 'left',
  amenities = [],
  amenitiesBgColor = '#e9f0f7',
  amenitiesPadding = 32,
  roomFilters = { type: 'Standard', price: 'under99', beds: '1' },
  roomFilterOptions = { type: ['Standard', 'Deluxe', 'VIP'], price: ['under99', '99-199', '199-299'], beds: ['1', '2'] },
  rooms = [],
  roomsBgColor = '#fff',
  roomsPadding = 32,
  footerLogo = '',
  footerName = 'LOGO TEXT HERE',
  footerSlogan = 'SLOGAN HERE',
  footerLinks = ['Home', 'About', 'Contact'],
  footerContacts = [
    { type: 'email', value: 'info@hotel.com' },
    { type: 'phone', value: '+1234567890' }
  ],
  footerSocials = [
    { icon: 'fa-facebook-f', name: 'Facebook', handle: 'hotel' },
    { icon: 'fa-instagram', name: 'Instagram', handle: '@hotel' }
  ],
  footerBgColor = '#222',
  footerPadding = 32,
  previewMode = 'desktop',
  footerLocation = '',
}) {
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const aboutSectionRef = useRef(null);
  const amenitiesSectionRef = useRef(null);
  const roomsSectionRef = useRef(null);

  // Add local state for room filters
  const [selectedType, setSelectedType] = useState(roomFilters.type || (roomFilterOptions.type && roomFilterOptions.type[0]) || 'Standard');
  const [selectedPrice, setSelectedPrice] = useState(roomFilters.price || (roomFilterOptions.price && roomFilterOptions.price[0]) || 'under99');
  const [selectedBeds, setSelectedBeds] = useState(roomFilters.beds || (roomFilterOptions.beds && roomFilterOptions.beds[0]) || '1');

  // Update filter state if roomFilterOptions changes
  React.useEffect(() => {
    if (roomFilterOptions.type && !roomFilterOptions.type.includes(selectedType)) {
      setSelectedType(roomFilterOptions.type[0] || '');
    }
  }, [roomFilterOptions.type]);

  // Update filter options for price
  const priceOptions = [
    { value: 'All', label: 'All' },
    { value: 'Under100', label: 'Under 100' },
    { value: '100-299', label: '100-299' },
    { value: '300-499', label: '300-499' },
    { value: '500+', label: '500+' },
  ];

  // Filtering logic
  const filteredRooms = rooms.filter(r => {
    let match = true;
    // Type filter
    if (selectedType && selectedType !== 'All' && r.room_type && r.room_type !== selectedType) match = false;
    // Capacity filter
    if (selectedBeds && selectedBeds !== 'All' && String(r.capacity) !== String(selectedBeds)) match = false;
    // Price filter
    if (selectedPrice && selectedPrice !== 'All') {
      const price = Number(r.price_per_night || r.price);
      if (selectedPrice === 'Under100' && price >= 100) match = false;
      if (selectedPrice === '100-299' && (price < 100 || price > 299)) match = false;
      if (selectedPrice === '300-499' && (price < 300 || price > 499)) match = false;
      if (selectedPrice === '500+' && price < 500) match = false;
    }
    return match;
  });

  const [reservationModal, setReservationModal] = useState({ open: false, room: null });
  const [reservationForm, setReservationForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    client_name: '',
    client_email: '',
    client_phone: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const navigate = useNavigate();

  // Handler to open modal for a room
  function handleBookNow(room) {
    const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : '';
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '';
    const token = localStorage.getItem('token');
    if (!token || !userName || !userEmail) {
      alert('Please log in or sign up to book a room.');
      window.location.href = '/login';
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

  // Handler for reservation submit
  async function handleReservationSubmit(e) {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');
    try {
      const token = localStorage.getItem('token');
      const reservation = await createReservation({
        room: reservationModal.room.id,
        check_in: reservationForm.checkIn,
        check_out: reservationForm.checkOut,
        guests: Number(reservationForm.guests),
        price: Number(reservationModal.room.price_per_night || reservationModal.room.price),
        room_image: reservationModal.room.image,
        client_name: reservationForm.client_name,
        client_email: reservationForm.client_email,
        client_phone: reservationForm.client_phone,
      }, token);
      // Redirect to payment page with reservation and room info
      navigate('/payment', {
        state: {
          reservationId: reservation.id,
          amount: Number(reservationModal.room.price_per_night || reservationModal.room.price),
          client_name: reservationForm.client_name,
          client_email: reservationForm.client_email,
          room: reservationModal.room,
          returnTo: window.location.pathname
        }
      });
      setBookingSuccess(true);
      setReservationModal({ open: false, room: null });
    } catch (err) {
      setBookingError('Reservation failed: ' + (err.message || 'Unknown error'));
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <div className={`editor-preview-main`}>
      {/* <div className="preview-mode-toggle" style={{ display: 'none' }} /> */}
      <div className={`editor-preview-wrapper ${previewMode}`}>
        <div
          className="editor-preview"
          style={{
            ...(bgType === 'color' ? { background: fields.bgColor } : { position: 'relative', background: 'transparent' }),
            position: 'relative',
          }}
        >
          {bgType === 'image' && (
            <div
              className="editor-bg-image"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                filter: `brightness(${bgBrightness})`,
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                position: 'absolute',
              }}
            />
          )}
          {/* Previewed Navbar */}
          {previewMode === 'mobile' ? (
            <div
              className="preview-navbar mobile"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: `${navbarPadding}px`,
                background: 'none',
                color: fields.textColor,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              <div className="editor-logo" style={{ color: fields.textColor, fontSize: '1.1rem', display: 'flex', flexDirection: 'column', gap: 0 }}>
                <span className="logo-text" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{fields.logo || 'LOGO TEXT HERE'}</span>
                <span className="logo-slogan" style={{ fontSize: '0.9rem', fontWeight: 400 }}>{fields.slogan || 'SLOGAN HERE'}</span>
              </div>
              <button
                className="mobile-menu-btn"
                style={{ background: 'none', border: 'none', color: fields.textColor, fontSize: '1.7rem', cursor: 'pointer' }}
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                <FontAwesomeIcon icon={["fas", mobileMenuOpen ? "fa-times" : "fa-bars"]} />
              </button>
              {mobileMenuOpen && (
                <div className="editor-nav-links-mobile" style={{
                  position: 'absolute',
                  top: '70%',
                  left: 0,
                  width: '100%',
                  background: 'rgba(0,0,0,0.9)',
                  color: '#fff',
                  borderRadius: '0 0 10px 10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  minWidth: '120px',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  padding: '0.5rem 1.2rem',
                }}>
                  <span style={{ margin: '0.5rem 0', cursor: 'pointer' }}>Home</span>
                  <span style={{ margin: '0.5rem 0', cursor: 'pointer' }} onClick={() => roomsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>Book Now</span>
                </div>
              )}
            </div>
          ) : (
            <div
              className="preview-navbar"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100px',
                padding: `${navbarPadding}px`,
                background: 'none',
                color: fields.textColor,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              <div className="editor-logo" style={{ color: fields.textColor }}>
                <span className="logo-text">{fields.logo || 'LOGO TEXT HERE'}</span>
                <span className="logo-slogan">{fields.slogan || 'SLOGAN HERE'}</span>
              </div>
              <div className="editor-nav-links">
                <span>Home</span>
                <span onClick={() => roomsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })} style={{ cursor: 'pointer' }}>Book Now</span>
              </div>
            </div>
          )}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
            {previewMode === 'mobile' ? <div style={{ height: '56px' }} /> : <div style={{ height: '60px' }} />}
            {/* Hero Section */}
            <section
              className="hero-section-preview"
              style={{
                minHeight: previewMode === 'mobile' ? '320px' : '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: previewMode === 'mobile' ? '18px' : '32px',
                width: '100%',
                padding: previewMode === 'mobile' ? '0 1rem' : undefined,
              }}
            >
              <div className="editor-content" style={{ width: '100%' }}>
                <h1 style={{ color: fields.textColor, fontSize: previewMode === 'mobile' ? '2rem' : undefined }}>{fields.title}</h1>
                <p style={{ color: fields.textColor, fontSize: previewMode === 'mobile' ? '1.1rem' : undefined }}>{fields.subtitle}</p>
                <button
                  className="editor-btn"
                  style={{
                    background: isBtnHovered ? buttonHoverBg : fields.buttonColor,
                    color: isBtnHovered ? buttonHoverText : fields.buttonTextColor,
                    width: previewMode === 'mobile' ? '100%' : undefined,
                    maxWidth: previewMode === 'mobile' ? '320px' : undefined,
                    fontSize: previewMode === 'mobile' ? '1.1rem' : undefined,
                  }}
                  onMouseEnter={() => setIsBtnHovered(true)}
                  onMouseLeave={() => setIsBtnHovered(false)}
                >
                  {fields.button}
                </button>
              </div>
            </section>
            {/* About Section Preview */}
            <section
              ref={aboutSectionRef}
              className="about-section-preview"
              style={{
                background: aboutBgColor,
                padding: `${aboutPadding}px 2rem`,
                display: 'flex',
                flexDirection: aboutLayout === 'center' ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: aboutLayout === 'center' ? 'center' : 'space-between',
                textAlign: aboutLayout === 'center' ? 'center' : aboutLayout === 'left' ? 'left' : 'right',
                gap: '2rem',
              }}
            >
              {(aboutLayout === 'left' || aboutLayout === 'center') && (
                <div style={{ flex: 1, order: aboutLayout === 'right' ? 2 : 1 }}>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 500, marginBottom: '1rem', letterSpacing: '2px' }}>{aboutTitle}</h2>
                  <p style={{ fontSize: '1.2rem', color: '#1a3a5a', marginBottom: '1rem' }}>{aboutParagraph}</p>
                </div>
              )}
              {aboutImage && (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', order: aboutLayout === 'right' ? 1 : 2 }}>
                  <img src={aboutImage} alt="About" style={{ maxWidth: '320px', maxHeight: '180px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }} />
                </div>
              )}
              {aboutLayout === 'right' && (
                <div style={{ flex: 1, order: 2 }}>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 500, marginBottom: '1rem', letterSpacing: '2px' }}>{aboutTitle}</h2>
                  <p style={{ fontSize: '1.2rem', color: '#1a3a5a', marginBottom: '1rem' }}>{aboutParagraph}</p>
                </div>
              )}
            </section>
            {/* Amenities Section Preview */}
            <section
              ref={amenitiesSectionRef}
              className="amenities-section-preview"
              style={{
                background: amenitiesBgColor,
                padding: `${amenitiesPadding}px 2rem`,
                marginTop: '0',
              }}
            >
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '2.5rem',
              }}>
                {amenities.map((a, idx) => (
                  <div key={idx} style={{ minWidth: 180, maxWidth: 240, textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '2.5rem', color: '#1a3a5a', marginBottom: '0.7rem' }}>
                      <FontAwesomeIcon icon={["fas", a.icon]} />
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 500, color: '#1a3a5a', marginBottom: '0.5rem' }}>{a.title}</div>
                    <div style={{ fontSize: '1rem', color: '#1a3a5a', opacity: 0.85 }}>{a.desc}</div>
                  </div>
                ))}
              </div>
            </section>
            {/* Rooms Section Preview */}
            <section
              ref={roomsSectionRef}
              className="rooms-section-preview"
              style={{
                background: roomsBgColor,
                padding: `${roomsPadding}px 2rem`,
                marginTop: '0',
              }}
            >
              {/* Filtering form */}
              <div className="room-filters" style={{ display: 'flex', gap: 16, margin: '0 0 24px 0', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem' }}><FontAwesomeIcon icon={["fas", "fa-bed"]} /></span>
                <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                  <option value="All">All</option>
                  {roomFilterOptions.type && roomFilterOptions.type.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <span style={{ fontSize: '1.2rem' }}><FontAwesomeIcon icon={["fas", "fa-dollar-sign"]} /></span>
                <select value={selectedPrice} onChange={e => setSelectedPrice(e.target.value)}>
                  {priceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <span style={{ fontSize: '1.2rem' }}><FontAwesomeIcon icon={["fas", "fa-users"]} /></span>
                <select value={selectedBeds} onChange={e => setSelectedBeds(e.target.value)}>
                  <option value="All">All</option>
                  {roomFilterOptions.beds && roomFilterOptions.beds.map(opt => <option key={opt} value={opt}>{opt} bed</option>)}
                </select>
              </div>
              {/* Room grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', alignItems: 'center', justifyContent: 'center', overflowX: 'auto', padding: '0 1rem' }}>
                {filteredRooms.map((r, idx) => (
                  <div key={r.id || idx} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: 240, height: 340, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {r.image ? <img src={r.image} alt={r.room_number} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} /> : <div style={{ width: '100%', height: 120, background: '#eee', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>No Image</div>}
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{r.room_number || '-'}</div>
                    <div style={{ fontSize: '0.98rem', color: '#444', marginBottom: 8 }}>{r.room_type || '-'}</div>
                    <div style={{ fontWeight: 600, color: 'var(--blue)', marginBottom: 8 }}>${r.price_per_night || r.price} <span style={{ fontWeight: 400, color: '#888' }}>/ night</span></div>
                    <div style={{ fontSize: '0.98rem', color: '#555', marginBottom: 8 }}>Beds: {r.capacity || '-'}</div>
                    <div style={{ fontSize: '0.98rem', color: r.is_available ? '#28a745' : '#c00', marginBottom: 8 }}>{r.is_available ? 'Available' : 'Not Available'}</div>
                    <button
                      className="btn book-now-btn"
                      disabled={!r.is_available}
                      onClick={() => handleBookNow(r)}
                      style={!r.is_available ? { background: '#ccc', cursor: 'not-allowed' } : {}}
                    >
                      {r.is_available ? 'Book Now' : 'Not Available'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
            {/* Footer Section Preview */}
            <footer
              className="footer-section-preview"
              style={{
                background: footerBgColor,
                color: '#fff',
                padding: `${footerPadding}px 2rem`,
                marginTop: '0',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 4 }}>{footerLogo || <FontAwesomeIcon icon={["fas", "fa-hotel"]} />}</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{footerName}</div>
                  <div style={{ fontSize: '0.98rem', opacity: 0.8 }}>{footerSlogan}</div>
                  {footerLocation && (
                    <div style={{ fontSize: '0.98rem', opacity: 0.8, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FontAwesomeIcon icon={["fas", "fa-map-marker-alt"]} style={{ marginRight: 4 }} />
                      <span>{footerLocation}</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Quick Links</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {footerLinks.map((l, i) => <li key={i} style={{ marginBottom: 4 }}><a href="#" style={{ color: '#fff', textDecoration: 'none', opacity: 0.9 }}>{l}</a></li>)}
                  </ul>
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Contact</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {footerContacts.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c.type === 'email' ? <FontAwesomeIcon icon={["fas", "fa-envelope"]} /> : <FontAwesomeIcon icon={["fas", "fa-phone"]} />} <span style={{ opacity: 0.9 }}>{c.value}</span></li>)}
                  </ul>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    {footerSocials.map((s, i) => <a key={i} href="#" style={{ color: '#fff', fontSize: '1.2rem', opacity: 0.9 }} title={s.name}><FontAwesomeIcon icon={["fab", s.icon.replace('fa-', '')]} /> <span style={{ fontSize: '0.95rem', marginLeft: 4 }}>{s.handle}</span></a>)}
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
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

