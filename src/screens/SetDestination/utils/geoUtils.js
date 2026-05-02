import { COORDINATE_EPSILON, ORS_API_KEY, ORS_DIRECTIONS_URL } from '../constants';

// Geocoding 
export async function geocodePlace(query) {
  const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'WakelyApp/1.0' } });
  const data = await res.json();

  if (!data.length) return null;

  return {
    coords: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
    label:  data[0].display_name,
  };
}

export async function reverseGeocodePlace(coords) {
  if (!coords) return null;

  const [lon, lat] = coords;
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'WakelyApp/1.0' } });
  const data = await res.json();

  const address = data?.address ?? {};

  const city =
    address.city        ??
    address.town        ??
    address.municipality ??
    address.village     ??
    address.county      ??
    address.state       ??
    null;

  const area =
    address.suburb        ??
    address.neighbourhood ??
    address.quarter       ??
    address.city_district ??
    address.district      ??
    address.borough       ??
    address.hamlet        ??
    null;

  if (city && area && city !== area) return `${city}, ${area}`;

  return city ?? area ?? data?.display_name ?? null;
}

// Routing 
export async function fetchRouteLine(originCoords, destinationCoords) {
  try {
    const res = await fetch(ORS_DIRECTIONS_URL, {
      method: 'POST',
      headers: {
        Accept:         'application/json, application/geo+json',
        Authorization:  ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coordinates: [originCoords, destinationCoords] }),
    });

    console.log('ORS STATUS:', res.status);

    const text = await res.text();
    console.log('ORS RAW RESPONSE:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.log('❌ NOT JSON RESPONSE');
      return [originCoords, destinationCoords];
    }

    const routeCoords = data?.features?.[0]?.geometry?.coordinates;
    return routeCoords?.length ? routeCoords : [originCoords, destinationCoords];
  } catch (err) {
    console.log('FETCH FAILED:', err);
    return [originCoords, destinationCoords];
  }
}

// Distance 
export function distanceInMeters(coordsA, coordsB) {
  if (!coordsA || !coordsB) return null;

  const R     = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const [lonA, latA] = coordsA;
  const [lonB, latB] = coordsB;

  const dLat = toRad(latB - latA);
  const dLon = toRad(lonB - lonA);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function haversineDistance(coordsA, coordsB) {
  const meters = distanceInMeters(coordsA, coordsB);
  if (meters === null) return null;
  const km = meters / 1000;
  return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(2)} km`;
}

export function areSameCoords(coordsA, coordsB) {
  if (!coordsA || !coordsB) return false;
  return (
    Math.abs(coordsA[0] - coordsB[0]) < COORDINATE_EPSILON &&
    Math.abs(coordsA[1] - coordsB[1]) < COORDINATE_EPSILON
  );
}

// Route Deviation 
function projectToMeters(coords, originLat) {
  const [lon, lat] = coords;
  return {
    x: lon * 111320 * Math.cos((originLat * Math.PI) / 180),
    y: lat * 110540,
  };
}

export function distanceToRouteInMeters(pointCoords, routeCoords) {
  if (!pointCoords || routeCoords.length < 2) return Infinity;

  const originLat     = pointCoords[1];
  const point         = projectToMeters(pointCoords, originLat);
  let closestDistance = Infinity;

  for (let i = 0; i < routeCoords.length - 1; i++) {
    const start = projectToMeters(routeCoords[i],     originLat);
    const end   = projectToMeters(routeCoords[i + 1], originLat);

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (dx === 0 && dy === 0) continue;

    const progress = Math.max(
      0,
      Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)),
    );

    const nearest = { x: start.x + progress * dx, y: start.y + progress * dy };
    closestDistance = Math.min(closestDistance, Math.hypot(point.x - nearest.x, point.y - nearest.y));
  }

  return closestDistance;
}