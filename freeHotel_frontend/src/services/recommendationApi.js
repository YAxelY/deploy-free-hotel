const BASE = 'http://localhost:8000/api/recommendation';

export async function getPersonalizedRoomRecommendations(token) {
    const res = await fetch(`${BASE}/rooms/user/`, {
        headers: { Authorization: `Token ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return await res.json();
}

export async function getRoomRecommendations(roomId, token) {
    const res = await fetch(`${BASE}/rooms/${roomId}/`, {
        headers: { Authorization: `Token ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch room recommendations');
    return await res.json();
}

export async function getLocationHotelRecommendations(location, token) {
    const res = await fetch(`${BASE}/hotels/location/${encodeURIComponent(location)}/`, {
        headers: { Authorization: `Token ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch location recommendations');
    return await res.json();
}

export async function getPopularRoomRecommendations() {
    const res = await fetch(`${BASE}/rooms/popular/`);
    if (!res.ok) throw new Error('Failed to fetch popular recommendations');
    return await res.json();
} 