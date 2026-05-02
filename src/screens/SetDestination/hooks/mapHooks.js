import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';
import {
  OSM_STYLE_URL,
  REVERSE_GEOCODE_DISTANCE_METERS,
  ROUTE_REFRESH_INTERVAL_MS,
} from '../constants';
import {
  areSameCoords,
  distanceInMeters,
  fetchRouteLine,
  reverseGeocodePlace,
} from '../utils/geoUtils';

// Handles reverse-geocoding for a single coordinate slot (user or destination).
function useLocationName() {
  const [name, setName]         = useState(null);
  const requestIdRef            = useRef(0);
  const lastCoordsRef           = useRef(null);

  const refresh = useCallback(async (coords, options = {}) => {
    if (!coords) return;

    const movedDistance = distanceInMeters(lastCoordsRef.current, coords);

    if (
      !options.force &&
      movedDistance !== null &&
      movedDistance < REVERSE_GEOCODE_DISTANCE_METERS
    ) return;

    lastCoordsRef.current = coords;

    const requestId = ++requestIdRef.current;
    setName(null);

    try {
      const placeName = await reverseGeocodePlace(coords);
      if (requestIdRef.current !== requestId) return;
      setName(placeName);
    } catch {
      if (requestIdRef.current !== requestId) return;
      setName(null);
    }
  }, []);

  return { name, refresh };
}

// Map style loading + camera state.
export function useMapState() {
  const [baseMapStyle, setBaseMapStyle] = useState(null);
  const [cameraCenter, setCameraCenter] = useState(null);
  const [recenterKey,  setRecenterKey]  = useState(0);
  const [mapCenter,    setMapCenter]    = useState(null);
  const isMountedRef                    = useRef(true);

  async function loadBaseMapStyle() {
    try {
      const res  = await fetch(OSM_STYLE_URL);
      const data = await res.json();
      if (isMountedRef.current) setBaseMapStyle(data);
    } catch {
      if (isMountedRef.current) setBaseMapStyle(null);
    }
  }

  function flyTo(coords) {
    setCameraCenter(coords);
    setRecenterKey((k) => k + 1);
  }

  function handleCameraChanged(event) {
    const coordinates =
      event?.geometry?.coordinates ??
      event?.properties?.center ??
      event?.features?.[0]?.geometry?.coordinates;

    if (!coordinates) return;

    setMapCenter((prev) => (areSameCoords(prev, coordinates) ? prev : coordinates));
  }

  return {
    baseMapStyle,
    cameraCenter,
    recenterKey,
    mapCenter,
    isMountedRef,
    loadBaseMapStyle,
    flyTo,
    handleCameraChanged,
  };
}

// GPS permission, initial fix, and live updates.
export function useUserLocation({ isScreenActive, onFirstFix }) {
  const [userCoords, setUserCoords] = useState(null);
  const { name: userLocationName, refresh: refreshUserName } = useLocationName();

  async function requestInitialLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    if (!isScreenActive.current) return;

    const coords = [initial.coords.longitude, initial.coords.latitude];
    setUserCoords(coords);
    refreshUserName(coords, { force: true });
    onFirstFix?.(coords);
  }

  function handleLocationUpdate(location) {
    if (!isScreenActive.current) return;
    const coords = [location.coords.longitude, location.coords.latitude];
    setUserCoords((prev) => (areSameCoords(prev, coords) ? prev : coords));
    refreshUserName(coords);
    // Dev mode: route is not auto-refreshed on every GPS tick to protect ORS quota.
  }

  return { userCoords, userLocationName, requestInitialLocation, handleLocationUpdate };
}

// ORS route fetching with debounce + request-ID guard.
export function useRouting(isMountedRef) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [isRouting,   setIsRouting]   = useState(false);
  const routeCoordsRef                = useRef([]);
  const routeRequestId                = useRef(0);
  const lastRouteRefreshRef           = useRef(0);

  function commitRouteCoords(next) {
    routeCoordsRef.current = next;
    setRouteCoords(next);
  }

  const refreshRoute = useCallback(async (originCoords, destinationCoords, options = {}) => {
    if (!originCoords || !destinationCoords) return;

    const now = Date.now();
    if (!options.force && now - lastRouteRefreshRef.current < ROUTE_REFRESH_INTERVAL_MS) return;
    lastRouteRefreshRef.current = now;

    const requestId = ++routeRequestId.current;
    setIsRouting(true);

    try {
      const next = await fetchRouteLine(originCoords, destinationCoords);
      if (!isMountedRef.current || routeRequestId.current !== requestId) return;
      commitRouteCoords(next);
    } catch {
      if (!isMountedRef.current || routeRequestId.current !== requestId) return;
      commitRouteCoords([originCoords, destinationCoords]);
    } finally {
      if (isMountedRef.current && routeRequestId.current === requestId) setIsRouting(false);
    }
  }, [isMountedRef]);

  return { routeCoords, isRouting, commitRouteCoords, refreshRoute };
}

// Destination pin state + its reverse-geocoded name.
export function useDestination() {
  const [destination, setDestination] = useState(null);
  const destinationRef                = useRef(null);
  const { name: destinationName, refresh: refreshDestinationName } = useLocationName();

  function setAndTrack(coords) {
    destinationRef.current = coords;
    setDestination(coords);
    if (coords) refreshDestinationName(coords, { force: true });
  }

  function clear() {
    destinationRef.current = null;
    setDestination(null);
  }

  return { destination, destinationRef, destinationName, setAndTrack, clear };
}