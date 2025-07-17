const API_BASE = "http://localhost:8000/api/hotels/";

export async function createHotel(data, token) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateHotel(id, data, token) {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function publishHotel(id, token) {
  const res = await fetch(`${API_BASE}${id}/publish/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return res.json();
}

export async function getOwnerHotels(token) {
  const res = await fetch(API_BASE, {
    headers: { Authorization: `Token ${token}` },
  });
  return res.json();
}

export async function getPublicHotels() {
  const res = await fetch(`${API_BASE}public/`);
  return res.json();
}

export async function previewHotel(id, token) {
  const res = await fetch(`${API_BASE}${id}/preview/`, {
    headers: { Authorization: `Token ${token}` },
  });
  return res.json();
}

export async function deleteHotel(id, token) {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Token ${token}` },
  });
  return res;
}

// Room API
export async function getRooms(hotelId, token) {
  const res = await fetch(`${API_BASE}${hotelId}/rooms/`, {
    headers: token ? { Authorization: `Token ${token}` } : {},
  });
  return res.json();
}

export async function createRoom(hotelId, data, token) {
  let body, headers;
  if (data instanceof FormData) {
    body = data;
    headers = { Authorization: `Token ${token}` };
  } else {
    body = JSON.stringify(data);
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    };
  }
  const res = await fetch(`${API_BASE}${hotelId}/rooms/`, {
    method: "POST",
    headers,
    body,
  });
  return res.json();
}

export async function updateRoom(hotelId, roomId, data, token) {
  let body, headers;
  if (data instanceof FormData) {
    body = data;
    headers = { Authorization: `Token ${token}` };
  } else {
    body = JSON.stringify(data);
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    };
  }
  const res = await fetch(`${API_BASE}${hotelId}/rooms/${roomId}/`, {
    method: "PUT",
    headers,
    body,
  });
  return res.json();
}

export async function deleteRoom(hotelId, roomId, token) {
  const res = await fetch(`${API_BASE}${hotelId}/rooms/${roomId}/`, {
    method: "DELETE",
    headers: { Authorization: `Token ${token}` },
  });
  return res;
}

// Recommendation API
export async function getRoomRecommendations(roomId, token) {
  const res = await fetch(`${API_BASE}${roomId}/recommendations/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return res.json();
}

export async function getLocationHotelRecommendations(location) {
  const res = await fetch(`${API_BASE}recommendations/location/${encodeURIComponent(location)}/`);
  return res.json();
}

export async function getPersonalizedRoomRecommendations(token) {
  const res = await fetch(`${API_BASE}recommendations/personalized/`, {
    headers: { Authorization: `Token ${token}` },
  });
  return res.json();
}

export async function getUserRoomRecommendations(token) {
  const res = await fetch(`${API_BASE}recommendations/user/`, {
    headers: { Authorization: `Token ${token}` },
  });
  return res.json();
}