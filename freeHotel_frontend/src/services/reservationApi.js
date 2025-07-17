const API_BASE = "http://localhost:8000/api/reservations/";

export async function createReservation(data, token) {
    const res = await fetch(`${API_BASE}create/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getReservations(token) {
    const res = await fetch(API_BASE, {
        headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function deleteReservation(reservationId, token) {
    const res = await fetch(`${API_BASE}${reservationId}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
}

export async function updateReservationStatus(reservationId, status, token) {
    const res = await fetch(`http://localhost:8000/api/reservations/${reservationId}/update_status/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
} 