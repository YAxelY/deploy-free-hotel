// paymentApi.js - Service for payment-related API calls

const API_BASE = 'http://localhost:8000/api/payment';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}` // Change to Bearer if needed
    };
}

export async function createPayment(data) {
    // Route to correct endpoint based on payment_type
    let endpoint = '/pay/plan/';
    if (data.payment_type === 'reservation') {
        endpoint = '/pay/reservation/';
    }
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to complete payment');
    return await res.json();
}

export async function createPaymentIntent(data) {
    const res = await fetch(`${API_BASE}/create-intent/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create payment intent');
    return await res.json();
}

export async function getPayment(paymentId) {
    const res = await fetch(`${API_BASE}/${paymentId}/`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch payment');
    return await res.json();
} 