// reviewApi.js

// const BASE_URL = '/api/hotels/reviews/';
const BASE_URL = "http://localhost:8000/api/hotels/reviews/";

export async function getReviews() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return await res.json();
}

export async function createReview(formData, token) {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            Authorization: `Token ${token}`
            // Do NOT set 'Content-Type' here!
        },
        body: formData
    });
    if (!res.ok) throw new Error('Failed to create review');
    return await res.json();
}

export async function deleteReview(id, token) {
    const res = await fetch(`${BASE_URL}${id}/`, {
        method: 'DELETE',
        headers: {
            Authorization: `Token ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to delete review');
    return true;
}

export async function getReviewStats() {
    const res = await fetch("http://localhost:8000/api/hotels/reviews/stats/");
    if (!res.ok) throw new Error('Failed to fetch review stats');
    return await res.json();
} 