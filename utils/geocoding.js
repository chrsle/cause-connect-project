const axios = require('axios');

// Calculate distance between two coordinates (in miles)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get coordinates from location text
async function getCoordinates(location) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
      { headers: { 'User-Agent': 'CauseConnectApp' } }
    );
    return response.data?.[0] ? {
      lat: parseFloat(response.data[0].lat),
      lon: parseFloat(response.data[0].lon)
    } : null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

module.exports = { calculateDistance, getCoordinates };