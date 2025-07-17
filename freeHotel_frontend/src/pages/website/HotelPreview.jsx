import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HotelWebsitePreview from '../../components/hotelWebsitePreview';
import '../../components/hotelWebsitePreview.css';

export default function HotelPreview() {
    const { hotelId } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        async function fetchHotel() {
            try {
                // Use the public preview endpoint for hotel details
                const res = await fetch(`http://localhost:8000/api/hotels/public/?id=${hotelId}`);
                if (res.ok) {
                    const data = await res.json();
                    // If the API returns a list, find the hotel by id
                    let hotelData = data.results ? data.results.find(h => String(h.id) === String(hotelId)) : null;
                    if (!hotelData && data.id) hotelData = data; // fallback if single object
                    setHotel(hotelData);
                    setRooms(Array.isArray(hotelData?.rooms) ? hotelData.rooms : []);
                }
            } catch (err) {
                // handle error
            } finally {
                setLoading(false);
            }
        }
        fetchHotel();
    }, [hotelId]);

    // Set favicon and title from finishing touches
    useEffect(() => {
        if (!hotel) return;
        const t = hotel.template_data || {};
        const favicon = t.favicon;
        const title = t.socialTitle || hotel.name || 'Hotel Preview';
        // Save previous values
        const prevTitle = document.title;
        const prevFavicon = document.querySelector("link[rel='icon']")?.href;
        // Set new title
        document.title = title;
        // Set new favicon
        let faviconTag = document.querySelector("link[rel='icon']");
        if (!faviconTag) {
            faviconTag = document.createElement('link');
            faviconTag.rel = 'icon';
            document.head.appendChild(faviconTag);
        }
        if (favicon) {
            faviconTag.href = favicon;
        }
        // Cleanup: restore previous title and favicon
        return () => {
            document.title = prevTitle;
            if (faviconTag && prevFavicon) faviconTag.href = prevFavicon;
        };
    }, [hotel]);

    if (loading) return <div>Loading preview...</div>;
    if (!hotel) return <div>Hotel not found.</div>;

    const t = hotel.template_data || {};
    // Filter options (match templateEditor and hotelWebsitePreview)
    const typeOptions = ['Standard', 'Deluxe', 'VIP'];
    const priceOptions = ['All', 'Under100', '100-299', '300-499', '500+'];
    const bedsOptions = ['1', '2'];
    const roomFilterOptions = { type: typeOptions, price: priceOptions, beds: bedsOptions };
    const roomFilters = { type: 'All', price: 'All', beds: 'All' };

    return (
        <div style={{ minWidth: '100vw', width: '100vw', minHeight: '100vh', height: '100vh', background: 'transparent', overflow: 'auto', fontFamily: 'sans-serif', marginTop: 0, padding: 0, position: 'relative' }}>
            <style>{`.editor-preview-main { top: 0 !important; position: absolute !important; left: 0; right: 0; }`}</style>
            <HotelWebsitePreview
                fields={t.fields || {}}
                bgType={t.bgType || 'color'}
                bgImage={t.bgImage || ''}
                bgBrightness={t.bgBrightness || 1}
                buttonHoverBg={t.buttonHoverBg || '#ffe066'}
                buttonHoverText={t.buttonHoverText || '#0b3e66'}
                navbarPadding={t.navbarPadding || 24}
                heroPadding={t.heroPadding || 32}
                aboutTitle={t.aboutTitle || 'THE PERFECT GETAWAY'}
                aboutParagraph={t.aboutParagraph || hotel.description}
                aboutImage={t.aboutImage || null}
                aboutBgColor={t.aboutBgColor || '#e9f0f7'}
                aboutPadding={t.aboutPadding || 32}
                aboutLayout={t.aboutLayout || 'left'}
                amenities={t.amenities || []}
                amenitiesBgColor={t.amenitiesBgColor || '#e9f0f7'}
                amenitiesPadding={t.amenitiesPadding || 32}
                roomFilters={roomFilters}
                roomFilterOptions={roomFilterOptions}
                rooms={rooms}
                roomsBgColor={t.roomsBgColor || '#fff'}
                roomsPadding={t.roomsPadding || 32}
                footerLogo={t.footerLogo || ''}
                footerName={hotel.logo_text || hotel.name}
                footerLocation={t.footerLocation || hotel.location || ''}
                footerSlogan={t.footerSlogan || hotel.slogan || ''}
                footerLinks={t.footerLinks || ['Home', 'About', 'Contact']}
                footerContacts={t.footerContacts || [
                    { type: 'email', value: hotel.footer_email || hotel.email },
                    { type: 'phone', value: hotel.footer_phone || hotel.phone_number }
                ]}
                footerSocials={t.footerSocials || []}
                footerBgColor={t.footerBgColor || '#222'}
                footerPadding={t.footerPadding || 32}
                previewMode={'desktop'}
                style={{ minWidth: '100vw', width: '100vw', minHeight: '100vh', height: '100vh', marginTop: 0, padding: 0 }}
            />
        </div>
    );
} 