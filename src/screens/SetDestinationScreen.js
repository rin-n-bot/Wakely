import { Ionicons } from '@expo/vector-icons';
import {
  Camera,
  Map,
  UserLocation,
} from '@maplibre/maplibre-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassButton from '../components/GlassButton';
import GlassCard from '../components/GlassCard';
import { COLORS, FONTS } from '../constants/theme';


// ─── Constants ────────────────────────────────────────────────────────────────

const OSM_STYLE_URL  = 'https://tiles.openfreemap.org/styles/dark';
const DEFAULT_CENTER = [125.4553, 7.1907];

const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;
const ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

const ROUTE_REFRESH_DISTANCE_METERS = 35;
const ROUTE_REFRESH_INTERVAL_MS = 15000;
const REVERSE_GEOCODE_DISTANCE_METERS = 100;
const COORDINATE_EPSILON = 0.000001;


// ─── Utilities ────────────────────────────────────────────────────────────────

async function geocodePlace(query) {
  const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'WakelyApp/1.0' } });
  const data = await res.json();

  if (!data.length) return null;

  return {
    coords: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
    label:  data[0].display_name,
  };
}

async function reverseGeocodePlace(coords) {
  if (!coords) return null;

  const [lon, lat] = coords;
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'WakelyApp/1.0',
    },
  });

  const data = await res.json();
  const address = data?.address ?? {};

  const city =
    address.city ??
    address.town ??
    address.municipality ??
    address.village ??
    address.county ??
    address.state ??
    null;

  const area =
    address.suburb ??
    address.neighbourhood ??
    address.quarter ??
    address.city_district ??
    address.district ??
    address.borough ??
    address.hamlet ??
    null;

  if (city && area && city !== area) {
    return `${city}, ${area}`;
  }

  return city ?? area ?? data?.display_name ?? null;
}


async function fetchRouteLine(originCoords, destinationCoords) {
  try {
    const res = await fetch(ORS_DIRECTIONS_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json, application/geo+json',
        Authorization: ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [originCoords, destinationCoords],
      }),
    });

    console.log('ORS STATUS:', res.status);

    const text = await res.text();
    console.log('ORS RAW RESPONSE:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log('❌ NOT JSON RESPONSE');
      return [originCoords, destinationCoords];
    }

    const routeCoords = data?.features?.[0]?.geometry?.coordinates;

    return routeCoords?.length
      ? routeCoords
      : [originCoords, destinationCoords];

  } catch (err) {
    console.log('FETCH FAILED:', err);
    return [originCoords, destinationCoords];
  }
}


function distanceInMeters(coordsA, coordsB) {
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

function haversineDistance(coordsA, coordsB) {
  const meters = distanceInMeters(coordsA, coordsB);

  if (meters === null) return null;

  const km = meters / 1000;

  return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(2)} km`;
}

function areSameCoords(coordsA, coordsB) {
  if (!coordsA || !coordsB) return false;

  return (
    Math.abs(coordsA[0] - coordsB[0]) < COORDINATE_EPSILON &&
    Math.abs(coordsA[1] - coordsB[1]) < COORDINATE_EPSILON
  );
}

function projectToMeters(coords, originLat) {
  const [lon, lat] = coords;

  return {
    x: lon * 111320 * Math.cos((originLat * Math.PI) / 180),
    y: lat * 110540,
  };
}

function distanceToRouteInMeters(pointCoords, routeCoords) {
  if (!pointCoords || routeCoords.length < 2) return Infinity;

  const originLat = pointCoords[1];
  const point     = projectToMeters(pointCoords, originLat);

  let closestDistance = Infinity;

  for (let index = 0; index < routeCoords.length - 1; index += 1) {
    const start = projectToMeters(routeCoords[index], originLat);
    const end   = projectToMeters(routeCoords[index + 1], originLat);

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (dx === 0 && dy === 0) continue;

    const progress = Math.max(
      0,
      Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)),
    );

    const nearest = {
      x: start.x + progress * dx,
      y: start.y + progress * dy,
    };

    closestDistance = Math.min(closestDistance, Math.hypot(point.x - nearest.x, point.y - nearest.y));
  }

  return closestDistance;
}

function buildMapStyle(baseStyle, routeCoords, destination) {
  if (!baseStyle) return null;


  const routeData = {
    type: 'FeatureCollection',
    features: routeCoords.length >= 2
      ? [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeCoords,
            },
            properties: {},
          },
        ]
      : [],
  };

  const destinationData = {
    type: 'FeatureCollection',
    features: destination
      ? [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: destination,
            },
            properties: {},
          },
        ]
      : [],
  };

  return {
    ...baseStyle,
    sources: {
      ...baseStyle.sources,
      destinationRouteSource: {
        type: 'geojson',
        data: routeData,
      },
      destinationMarkerSource: {
        type: 'geojson',
        data: destinationData,
      },
    },
    layers: [
      ...(baseStyle.layers ?? []),
      {
        id: 'destination-route-glow',
        type: 'line',
        source: 'destinationRouteSource',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': 'rgba(124,92,232,0.28)',
          'line-width': 10,
          'line-opacity': 0.9,
        },
      },
      {
        id: 'destination-route-line',
        type: 'line',
        source: 'destinationRouteSource',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#9d6fff',
          'line-width': 5,
          'line-opacity': 1,
        },
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
      paint: {
        'circle-radius': 3,
        'circle-color': '#FFFFFF',
      },
    },

    ],
  };
}


// ─── Subcomponents ────────────────────────────────────────────────────────────

function ScreenHeader({ onBack, topInset }) {
  return (
    <View style={[styles.header, { paddingTop: topInset + 10 }]}>
      <TouchableOpacity hitSlop={12} activeOpacity={0.7} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Set Destination</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

function SearchBar({ value, onChange, onSubmit, isSearching }) {
  return (
    <GlassCard style={styles.searchCard}>
      <View style={styles.searchRow}>
        {isSearching
          ? <ActivityIndicator size="small" color={COLORS.textSecondary} />
          : <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
        }
        <TextInput
          style={styles.searchInput}
          placeholder="Search city, street, or place..."
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
        />
      </View>
    </GlassCard>
  );
}

function SelectionCard({
  destination,
  destinationName,
  userCoords,
  userLocationName,
  isPinMode,
  distanceLabel,
  isRouting,
  onSelectDestination,
  onClearDestination,
  onContinue,
}) {
  const destLabel = destination
    ? `${destination[1].toFixed(5)},  ${destination[0].toFixed(5)}`
    : 'Tap to place a pin';

  const locationLabel = userCoords
    ? `${userCoords[1].toFixed(5)},  ${userCoords[0].toFixed(5)}`
    : 'Locating...';

  const destinationCityLabel = destination
    ? destinationName ?? 'Finding city...'
    : 'Choose a destination';

  const userCityLabel = userCoords
    ? userLocationName ?? 'Finding city...'
    : 'Waiting for GPS';

  return (
    <GlassCard style={styles.selectionCard}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.selectionRow, isPinMode && styles.selectionRowActive]}
        onPress={!destination ? onSelectDestination : undefined}
      >
        <View style={styles.selectionIconBox}>
          <Ionicons name="location" size={22} color={COLORS.accent} />
        </View>

        <View style={styles.selectionText}>
          <Text style={styles.selectionLabel}>Destination</Text>
          <Text
            style={[styles.selectionValue, !destination && styles.selectionPlaceholder]}
            numberOfLines={1}
          >
            {destLabel}
          </Text>
          <Text style={styles.selectionCity} numberOfLines={2}>
  {destinationCityLabel}
</Text>

        </View>

        {isPinMode && !destination ? (
          <View style={styles.pinModeBadge}>
            <Text style={styles.pinModeBadgeText}>Placing...</Text>
          </View>
        ) : null}

        {destination && !isPinMode ? (
          <View style={styles.destinationMeta}>
            {isRouting ? (
              <ActivityIndicator size="small" color={COLORS.accent} />
            ) : null}

            {distanceLabel ? (
              <View style={styles.distancePill}>
                <Ionicons name="navigate-outline" size={11} color={COLORS.accent} />
                <Text style={styles.distancePillText}>{distanceLabel}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              hitSlop={10}
              activeOpacity={0.7}
              onPress={onClearDestination}
              style={styles.redoButton}
            >
              <Ionicons name="close" size={15} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : null}
      </TouchableOpacity>

      <View style={styles.selectionDivider} />

      <View style={styles.selectionRow}>
        <View style={styles.selectionIconBox}>
          <Ionicons name="navigate" size={22} color={COLORS.textSecondary} />
        </View>

        <View style={styles.selectionText}>
          <Text style={styles.selectionLabel}>Your Location</Text>
          <Text style={styles.selectionValue} numberOfLines={1}>
            {locationLabel}
          </Text>
<Text style={styles.selectionCity} numberOfLines={2}>
  {userCityLabel}
</Text>

        </View>
      </View>

      {destination && !isPinMode ? (
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.continueTouchable}
          onPress={onContinue}
        >
          <LinearGradient
            colors={['#9d6fff', '#7C5CE8', '#5c40cc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueLabel}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : null}
    </GlassCard>
  );
}



// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SetDestinationScreen({ navigation }) {
  const { top } = useSafeAreaInsets();

  const [baseMapStyle,       setBaseMapStyle]       = useState(null);
  const [searchQuery,        setSearchQuery]        = useState('');
  const [isSearching,        setIsSearching]        = useState(false);
  const [isRouting,          setIsRouting]          = useState(false);
  const [userCoords,         setUserCoords]         = useState(null);
  const [userLocationName,   setUserLocationName]   = useState(null);
  const [cameraCenter,       setCameraCenter]       = useState(null);
  const [recenterKey,        setRecenterKey]        = useState(0);
  const [destination,        setDestination]        = useState(null);
  const [destinationName,    setDestinationName]    = useState(null);
  const [isPinMode,          setIsPinMode]          = useState(false);
  const [mapCenter,          setMapCenter]          = useState(null);
  const [routeCoords,        setRouteCoords]        = useState([]);

  const isMounted               = useRef(true);
  const mapRef                  = useRef(null);
  const cameraRef               = useRef(null);
  const routeCoordsRef          = useRef([]);
  const destinationRef          = useRef(null);
  const routeRequestId          = useRef(0);
  const userPlaceRequestId      = useRef(0);
  const destinationRequestId    = useRef(0);
  const lastRouteRefreshRef     = useRef(0);
  const lastUserPlaceCoordsRef  = useRef(null);

  const mapStyle = useMemo(
    () => buildMapStyle(baseMapStyle, routeCoords, destination),
    [baseMapStyle, destination, routeCoords],
  );

  useEffect(() => {
    requestInitialLocation();
    loadBaseMapStyle();

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    destinationRef.current = destination;
  }, [destination]);

  useEffect(() => {
    if (!destination) {
      setDestinationName(null);
      return;
    }

    refreshDestinationName(destination);
  }, [destination]);

  async function loadBaseMapStyle() {
    try {
      const res  = await fetch(OSM_STYLE_URL);
      const data = await res.json();

      if (isMounted.current) {
        setBaseMapStyle(data);
      }
    } catch {
      if (isMounted.current) {
        setBaseMapStyle(null);
      }
    }
  }

  async function requestInitialLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') return;

    const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

    if (!isMounted.current) return;

    const coords = [initial.coords.longitude, initial.coords.latitude];

    setUserCoords(coords);
    setCameraCenter(coords);
    setMapCenter(coords);
    refreshUserLocationName(coords, { force: true });
  }

  async function refreshUserLocationName(coords, options = {}) {
    if (!coords) return;

    const previousCoords = lastUserPlaceCoordsRef.current;
    const movedDistance  = distanceInMeters(previousCoords, coords);

    if (!options.force && movedDistance !== null && movedDistance < REVERSE_GEOCODE_DISTANCE_METERS) {
      return;
    }

    lastUserPlaceCoordsRef.current = coords;

    const requestId = userPlaceRequestId.current + 1;
    userPlaceRequestId.current = requestId;

    try {
      const placeName = await reverseGeocodePlace(coords);

      if (!isMounted.current || userPlaceRequestId.current !== requestId) return;

      setUserLocationName(placeName);
    } catch {
      if (!isMounted.current || userPlaceRequestId.current !== requestId) return;

      setUserLocationName(null);
    }
  }

  async function refreshDestinationName(coords) {
    const requestId = destinationRequestId.current + 1;
    destinationRequestId.current = requestId;

    setDestinationName(null);

    try {
      const placeName = await reverseGeocodePlace(coords);

      if (!isMounted.current || destinationRequestId.current !== requestId) return;

      setDestinationName(placeName);
    } catch {
      if (!isMounted.current || destinationRequestId.current !== requestId) return;

      setDestinationName(null);
    }
  }

  function commitRouteCoords(nextRouteCoords) {
    routeCoordsRef.current = nextRouteCoords;
    setRouteCoords(nextRouteCoords);
  }

  const refreshRoute = useCallback(async (originCoords, destinationCoords, options = {}) => {
    if (!originCoords || !destinationCoords) return;

    const now = Date.now();

    if (!options.force && now - lastRouteRefreshRef.current < ROUTE_REFRESH_INTERVAL_MS) {
      return;
    }

    lastRouteRefreshRef.current = now;

    const requestId = routeRequestId.current + 1;
    routeRequestId.current = requestId;

    setIsRouting(true);

    try {
      const nextRouteCoords = await fetchRouteLine(originCoords, destinationCoords);

      if (!isMounted.current || routeRequestId.current !== requestId) return;

      commitRouteCoords(nextRouteCoords);
    } catch {
      if (!isMounted.current || routeRequestId.current !== requestId) return;

      commitRouteCoords([originCoords, destinationCoords]);
    } finally {
      if (isMounted.current && routeRequestId.current === requestId) {
        setIsRouting(false);
      }
    }
  }, []);

  function handleLocationUpdate(location) {
    if (!isMounted.current) return;

    const coords = [location.coords.longitude, location.coords.latitude];

    setUserCoords((previousCoords) => {
      if (areSameCoords(previousCoords, coords)) return previousCoords;
      return coords;
    });

    refreshUserLocationName(coords);

// Dev mode: avoid auto-rerouting on every GPS movement to protect routing quota.
// Route is requested only when the user confirms a pin.

  }

  function handleCameraChanged(event) {
    const coordinates =
      event?.geometry?.coordinates ??
      event?.properties?.center ??
      event?.features?.[0]?.geometry?.coordinates;

    if (!coordinates) return;

    setMapCenter((previousCenter) => {
      if (areSameCoords(previousCenter, coordinates)) return previousCenter;
      return coordinates;
    });
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      const result = await geocodePlace(searchQuery);

      if (!isMounted.current) return;

      if (result) {
        setCameraCenter(result.coords);
        setRecenterKey((k) => k + 1);
      }
    } finally {
      if (isMounted.current) setIsSearching(false);
    }
  }

  function handleSelectDestination() {
    setIsPinMode((prev) => !prev);
  }

  async function handleConfirmPin() {
    let confirmedDestination = mapCenter;

    try {
      const liveCenter = await mapRef.current?.getCenter();

      if (liveCenter?.length === 2) {
        confirmedDestination = liveCenter;
      }
    } catch {
      confirmedDestination = mapCenter;
    }

    if (!confirmedDestination) return;

    const nextDestination = [...confirmedDestination];

    setDestination(nextDestination);
    setIsPinMode(false);
    commitRouteCoords([]);

    if (userCoords) {
      refreshRoute(userCoords, nextDestination, { force: true });
    }
  }

  function handleClearDestination() {
    setDestination(null);
    setDestinationName(null);
    commitRouteCoords([]);
    setIsPinMode(true);
  }

  function handleRecenter() {
    if (!userCoords) return;

    setCameraCenter([...userCoords]);
    setRecenterKey((k) => k + 1);
  }

  function handleContinue() {
    navigation?.navigate('SetAlarm');
  }

  const distanceLabel = haversineDistance(userCoords, destination);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {mapStyle ? (
  <Map
    ref={mapRef}
    style={styles.map}
    mapStyle={mapStyle}
    logoEnabled={false}
    logoPosition={{ bottom: -100, left: -100 }}
    attributionEnabled={false}
    attributionPosition={{ bottom: -100, right: -100 }}
    compassEnabled
    compassPosition={{ bottom: 540, right: 22 }}
    onCameraChanged={handleCameraChanged}
    onRegionIsChanging={handleCameraChanged}
    onRegionDidChange={handleCameraChanged}
  >
    <Camera
      key={recenterKey}
      ref={cameraRef}
      zoom={14}
      center={cameraCenter ?? DEFAULT_CENTER}
      animationMode={cameraCenter ? 'flyTo' : 'none'}
      animationDuration={600}
    />

    <UserLocation
      visible
      animated
      minDisplacement={0}
      onUpdate={handleLocationUpdate}
    />
  </Map>
) : (
  <View style={styles.mapLoading}>
    <ActivityIndicator size="large" color={COLORS.accent} />
  </View>
)}

      <View style={styles.mapTint} pointerEvents="none" />

      {isPinMode && (
        <View style={styles.crosshairWrapper} pointerEvents="none">
          <Ionicons name="location" size={42} color={COLORS.accent} />
          <View style={styles.crosshairDot} />
        </View>
      )}

      {isPinMode && (
        <View style={styles.confirmWrapper}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleConfirmPin}>
            <LinearGradient
              colors={['#9d6fff', '#7C5CE8', '#5c40cc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmGradient}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.confirmLabel}>Confirm Pin</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <SafeAreaView style={styles.overlay} edges={['bottom']} pointerEvents="box-none">

        <ScreenHeader
          onBack={() => navigation?.goBack()}
          topInset={top}
        />

        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            isSearching={isSearching}
          />
        </View>

        <View style={styles.mapSpacer} pointerEvents="none" />


        <View style={styles.recenterWrapper}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleRecenter}>
            <LinearGradient
              colors={['#9d6fff', '#7C5CE8', '#5c40cc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.recenterButton}
            >
              <Ionicons name="navigate" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSheetWrapper}>
          <View style={styles.bottomSheet}>
          <SelectionCard
            destination={destination}
            destinationName={destinationName}
            userCoords={userCoords}
            userLocationName={userLocationName}
            isPinMode={isPinMode}
            distanceLabel={distanceLabel}
            isRouting={isRouting}
            onSelectDestination={handleSelectDestination}
            onClearDestination={handleClearDestination}
            onContinue={handleContinue}
          />
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}


// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  overlay: {
    flex: 1,
  },

  mapTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,14,0.24)',
  },

  mapLoading: {
  ...StyleSheet.absoluteFillObject,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: COLORS.background,
},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  headerTitle: {
    ...FONTS.cardTitle,
    color: COLORS.textPrimary,
    fontSize: 18,
  },

  searchWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 0,
  },

  searchCard: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 2,
    includeFontPadding: false,
  },

  mapSpacer: {
    flex: 1,
  },

  crosshairWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 42,
  },

  crosshairDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginTop: -4,
  },

  confirmWrapper: {
    position: 'absolute',
    bottom: 270,
    alignSelf: 'center',
  },

  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },

  confirmLabel: {
    ...FONTS.cardButton,
    color: '#fff',
    fontSize: 15,
  },

  recenterWrapper: {
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 12,
    marginBottom: 590,
  },

  recenterButton: {
  width: 50,
  height: 50,
  borderRadius: 24,
  marginRight:  4,
  alignItems: 'center',
  justifyContent: 'center',
},

bottomSheetWrapper: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  paddingBottom: 16,
  paddingHorizontal: 16,
},

  bottomSheet: {
  paddingBottom: 0,
  },

  selectionCard: {
    gap: 0,
    paddingVertical: 14,
  },

selectionRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14,
  paddingVertical: 12,
  borderRadius: 12,
  paddingHorizontal: 4,
},

  selectionRowActive: {
    backgroundColor: 'rgba(124,92,232,0.10)',
    marginLeft: -8,
    marginRight: -8,
    paddingHorizontal: 12,
  },

  selectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

selectionText: {
  flex: 1,
  minWidth: 0,
  gap: 3,
},

  selectionLabel: {
    ...FONTS.sectionLabel,
    color: COLORS.textSecondary,
  },

selectionValue: {
  ...FONTS.cardTitle,
  color: COLORS.textPrimary,
  fontSize: 13,
},

  selectionPlaceholder: {
    color: COLORS.textSecondary,
  },

selectionCity: {
  ...FONTS.cardTitle,
  color: COLORS.textSecondary,
  fontSize: 15,
  lineHeight: 20,
},

  selectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
    marginLeft: 48,
  },

  pinModeBadge: {
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(124,92,232,0.4)',
    paddingHorizontal: 8,
    marginRight: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  pinModeBadgeText: {
    ...FONTS.cardMeta,
    color: COLORS.accent,
  },

destinationMeta: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginRight: 4,
  flexShrink: 0,
},

  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(124,92,232,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  distancePillText: {
    ...FONTS.cardMeta,
    color: COLORS.textPrimary,
    fontSize: 11,
  },

  redoButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueTouchable: {
    marginTop: 14,
  },

  continueGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },

  continueLabel: {
    ...FONTS.cardButton,
    color: '#fff',
    fontSize: 15,
  },

});
