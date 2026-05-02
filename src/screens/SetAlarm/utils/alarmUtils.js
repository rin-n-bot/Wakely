const METERS_PER_DEG_LAT = 110540;

export function formatMeters(meters) {
  return meters >= 1000 ? '1 km' : `${meters} m`;
}

export function buildCircleGeoJSON(centerCoords, radiusMeters, steps = 64) {
  if (!centerCoords) return { type: 'FeatureCollection', features: [] };

  const [lon, lat] = centerCoords;
  const degreesLat = radiusMeters / METERS_PER_DEG_LAT;
  const degreesLon = radiusMeters / (METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));

  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    coords.push([lon + degreesLon * Math.cos(angle), lat + degreesLat * Math.sin(angle)]);
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [coords] },
        properties: {},
      },
    ],
  };
}

export function buildPointGeoJSON(coords) {
  if (!coords) return { type: 'FeatureCollection', features: [] };
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: coords },
        properties: {},
      },
    ],
  };
}

export function cycleOption(options, current, setter) {
  const nextIndex = (options.indexOf(current) + 1) % options.length;
  setter(options[nextIndex]);
}