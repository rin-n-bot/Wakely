import { COLORS } from '../../../constants/theme';

export function buildMapStyle(baseStyle, routeCoords, destination) {
  if (!baseStyle) return null;

  const routeData = {
    type: 'FeatureCollection',
    features: routeCoords.length >= 2
      ? [{
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: routeCoords },
          properties: {},
        }]
      : [],
  };

  const destinationData = {
    type: 'FeatureCollection',
    features: destination
      ? [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: destination },
          properties: {},
        }]
      : [],
  };

  return {
    ...baseStyle,
    sources: {
      ...baseStyle.sources,
      destinationRouteSource:  { type: 'geojson', data: routeData },
      destinationMarkerSource: { type: 'geojson', data: destinationData },
    },
    layers: [
      ...(baseStyle.layers ?? []),
      {
        id: 'destination-route-glow',
        type: 'line',
        source: 'destinationRouteSource',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': 'rgba(124,92,232,0.28)', 'line-width': 10, 'line-opacity': 0.9 },
      },
      {
        id: 'destination-route-line',
        type: 'line',
        source: 'destinationRouteSource',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#9d6fff', 'line-width': 5, 'line-opacity': 1 },
      },
      {
        id: 'destination-marker-halo',
        type: 'circle',
        source: 'destinationMarkerSource',
        paint: {
          'circle-radius': 18,
          'circle-color': 'rgba(124,92,232,0.22)',
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.55)',
        },
      },
      {
        id: 'destination-marker-body',
        type: 'circle',
        source: 'destinationMarkerSource',
        paint: {
          'circle-radius': 10,
          'circle-color': COLORS.accent,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#FFFFFF',
        },
      },
      {
        id: 'destination-marker-center',
        type: 'circle',
        source: 'destinationMarkerSource',
        paint: { 'circle-radius': 3, 'circle-color': '#FFFFFF' },
      },
    ],
  };
}