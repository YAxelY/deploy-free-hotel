import React, { useEffect, useState } from 'react';
import { getReviews, deleteReview, getReviewStats } from '../../services/reviewApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import profile1 from '../../assets/images/profile1.jpg';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/navbar.jsx';
import Footer from '../../components/footer/footer.jsx';
import StarRating from '../../components/StarRating.jsx';
import { createReview } from '../../services/reviewApi';

const STAR_LABELS = [5, 4, 3, 2, 1];

export default function ReviewPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchStats() {
            setStatsLoading(true);
            try {
                const res = await getReviewStats();
                setStats(res);
            } catch {
                setStats(null);
            }
            setStatsLoading(false);
        }
        fetchStats();
    }, []);

    useEffect(() => {
        async function fetchReviews() {
            setLoading(true);
            try {
                const res = await getReviews();
                setReviews(Array.isArray(res.results) ? res.results : res);
            } catch {
                setError('Failed to load reviews.');
            }
            setLoading(false);
        }
        fetchReviews();
    }, []);

    // Calculate max bar width for stats
    const maxCount = stats ? Math.max(...Object.values(stats.stars)) : 1;

    return (
        <>
            <Navbar />
            <main style={{ minHeight: '70vh', background: '#fff', color: '#222', paddingTop: '5rem' }}>
        <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
            <button className="btn" style={{ marginBottom: 24 }} onClick={() => navigate('/')}>← Back to Home</button>
                    <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 32 }}>Ratings and reviews</h2>
                    {/* Review Statistics */}
                    <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {/* Average and total */}
                        <div style={{ minWidth: 120, textAlign: 'center' }}>
                            <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1 }}>{statsLoading ? '--' : stats?.average ?? '--'}</div>
                            <div style={{ fontSize: 24, margin: '8px 0' }}>
                                {[...Array(5)].map((_, i) => (
                                    <FontAwesomeIcon
                                        key={i}
                                        icon={['fas', 'fa-star']}
                                        style={{ color: (stats?.average ?? 0) >= i + 1 ? '#FFC107' : '#e0e0e0', fontSize: 22, marginRight: 2 }}
                                    />
                                ))}
                            </div>
                            <div style={{ fontSize: 18, color: '#888' }}>{statsLoading ? '' : stats?.total ?? ''} reviews</div>
                        </div>
                        {/* Star bars */}
                        <div style={{ flex: 1, minWidth: 220, maxWidth: 400 }}>
                            {STAR_LABELS.map((star) => (
                                <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ width: 18, fontSize: 16 }}>{star}</span>
                                    <FontAwesomeIcon icon={['fas', 'fa-star']} style={{ color: '#FFC107', fontSize: 16, margin: '0 6px' }} />
                                    <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 8, height: 10, margin: '0 8px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: stats && maxCount > 0 ? `${(stats.stars[star] / maxCount) * 100}%` : 0,
                                            background: '#379deb',
                                            height: '100%',
                                            borderRadius: 8,
                                            transition: 'width 0.4s'
                                        }} />
                                    </div>
                                    <span style={{ width: 32, textAlign: 'right', fontSize: 15 }}>{statsLoading ? '' : stats?.stars?.[star] ?? 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* End Review Statistics */}
                    <div style={{ maxWidth: 480, margin: '32px auto', background: '#fff', borderRadius: 24, boxShadow: '0 2px 16px #0001', padding: 32 }}>
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
            {loading ? (
                <div>Loading reviews...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : reviews.length === 0 ? (
                <div style={{ color: '#888', fontSize: '1.1rem', marginBottom: 16 }}>No reviews yet.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                    {reviews.map((review) => (
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
                                    {/* Was this review helpful? UI only */}
                                    <div style={{ marginTop: 10, color: '#888', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        Was this review helpful?
                                        <button className="btn" style={{ background: '#f0f0f0', color: '#222', borderRadius: 6, padding: '2px 14px', marginLeft: 8, fontSize: 14, border: '1px solid #e0e0e0' }}>Yes</button>
                                        <button className="btn" style={{ background: '#f0f0f0', color: '#222', borderRadius: 6, padding: '2px 14px', fontSize: 14, border: '1px solid #e0e0e0' }}>No</button>
                            </div>
                            {token && userEmail === review.email && (
                                        <button className="btn" style={{ marginTop: 12, background: '#e74c3c', color: '#fff' }}
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
        </div>
            </main>
            <Footer />
        </>
    );
} 