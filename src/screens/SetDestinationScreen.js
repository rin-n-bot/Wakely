import { Ionicons } from '@expo/vector-icons';
import {
  Camera,
  Map,
  UserLocation,
} from '@maplibre/maplibre-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
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


// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Geocode a text query to [lon, lat] using Nominatim (OpenStreetMap).
 * Returns null when no results are found.
 */
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

/**
 * Haversine formula — straight-line distance between two [lon, lat] points.
 * Returns a readable string like "3.45 km" or "340 m", or null if inputs are missing.
 */
function haversineDistance(coordsA, coordsB) {
  if (!coordsA || !coordsB) return null;

  const R      = 6371; // Earth radius in km
  const toRad  = (deg) => (deg * Math.PI) / 180;

  const [lonA, latA] = coordsA;
  const [lonB, latB] = coordsB;

  const dLat = toRad(latB - latA);
  const dLon = toRad(lonB - lonA);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLon / 2) ** 2;

  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Show meters when under 1 km for better readability
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`;
}


// ─── Subcomponents ────────────────────────────────────────────────────────────

/** Top bar with a back button and screen title. */
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

/** Search input that fires a Nominatim geocode on submit. */
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

/**
 * Bottom glass card that shows:
 *  - Destination row  → confirmed coords + distance badge, or placeholder text
 *  - Your Location row → live user coordinates
 *  - Continue button  → appears only after a destination is confirmed
 *
 * While in pin-placement mode the destination row shows a "Placing…" badge.
 * After a pin is confirmed it shows the coords and a small × button to redo.
 */
function SelectionCard({
  destination,
  userCoords,
  isPinMode,
  distanceLabel,
  onSelectDestination,
  onClearDestination,
  onContinue,
}) {
  // What to show in the destination value line
  const destLabel = destination
    ? `${destination[1].toFixed(5)},  ${destination[0].toFixed(5)}`
    : 'Tap to place a pin';

  const locationLabel = userCoords
    ? `${userCoords[1].toFixed(5)},  ${userCoords[0].toFixed(5)}`
    : 'Locating...';

  return (
    <GlassCard style={styles.selectionCard}>

      {/* ── Destination row ─────────────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.selectionRow, isPinMode && styles.selectionRowActive]}
        // Only allow tapping into pin mode when no destination is set yet,
        // or when the user taps the row (not the × button) to re-enter pin mode
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
        </View>

        {/* Show "Placing…" badge while the pin is being dragged */}
        {isPinMode && !destination && (
          <View style={styles.pinModeBadge}>
            <Text style={styles.pinModeBadgeText}>Placing...</Text>
          </View>
        )}

        {/* Show distance pill + × redo button once a destination is confirmed */}
        {destination && !isPinMode && (
          <View style={styles.destinationMeta}>

            {/* Distance from current user location to the pinned destination */}
            {distanceLabel && (
              <View style={styles.distancePill}>
                <Ionicons name="navigate-outline" size={11} color={COLORS.accent} />
                <Text style={styles.distancePillText}>{distanceLabel}</Text>
              </View>
            )}

            {/* × button — clears the destination so the user can redo */}
            <TouchableOpacity
              hitSlop={10}
              activeOpacity={0.7}
              onPress={onClearDestination}
              style={styles.redoButton}
            >
              <Ionicons name="close" size={15} color={COLORS.textSecondary} />
            </TouchableOpacity>

          </View>
        )}
      </TouchableOpacity>

      <View style={styles.selectionDivider} />

      {/* ── Current location row (display only) ─────────────────────────── */}
      <View style={styles.selectionRow}>
        <View style={styles.selectionIconBox}>
          <Ionicons name="navigate" size={22} color={COLORS.textSecondary} />
        </View>
        <View style={styles.selectionText}>
          <Text style={styles.selectionLabel}>Your Location</Text>
          <Text style={styles.selectionValue} numberOfLines={1}>{locationLabel}</Text>
        </View>
      </View>

      {/* ── Continue button — only shown when destination is confirmed ───── */}
      {destination && !isPinMode && (
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
      )}

    </GlassCard>
  );
}


// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SetDestinationScreen({ navigation }) {
  const { top } = useSafeAreaInsets();

  const [searchQuery,  setSearchQuery]  = useState('');
  const [isSearching,  setIsSearching]  = useState(false);
  const [userCoords,   setUserCoords]   = useState(null);   // live user [lon, lat]
  const [cameraCenter, setCameraCenter] = useState(null);   // triggers camera animation
  const [recenterKey,  setRecenterKey]  = useState(0);      // bump to re-fire camera
  const [destination,  setDestination]  = useState(null);   // confirmed pin [lon, lat]
  const [isPinMode,    setIsPinMode]    = useState(false);  // true while dragging crosshair
  const [mapCenter,    setMapCenter]    = useState(null);   // current map center [lon, lat]

  const isMounted = useRef(true);
  const cameraRef = useRef(null);

  useEffect(() => {
    requestInitialLocation();
    return () => { isMounted.current = false; };
  }, []);

  /** Ask for location permission and fly the camera to the user's position. */
  async function requestInitialLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    if (!isMounted.current) return;
    const coords = [initial.coords.longitude, initial.coords.latitude];
    setUserCoords(coords);
    setCameraCenter(coords);
    setMapCenter(coords);
  }

  /** Keep userCoords in sync as the device moves. */
  function handleLocationUpdate(location) {
    if (!isMounted.current) return;
    const coords = [location.coords.longitude, location.coords.latitude];
    setUserCoords(coords);
  }

  /** Track the map center as the user pans — used to read the pin position on confirm. */
  function handleCameraChanged(event) {
    const { geometry } = event;
    if (geometry?.coordinates) {
      setMapCenter(geometry.coordinates);
    }
  }

  /** Geocode the search query and fly the camera to the result. */
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

  /** Toggle pin-placement mode on/off. */
  function handleSelectDestination() {
    setIsPinMode((prev) => !prev);
  }

  /**
   * Confirm the crosshair position as the destination.
   * Saves map center coords and exits pin mode.
   */
  function handleConfirmPin() {
    if (!mapCenter) return;
    setDestination([...mapCenter]);
    setIsPinMode(false);
  }

  /**
   * Clear the confirmed destination so the user can start over.
   * Re-enters pin mode automatically for a smooth redo flow.
   */
  function handleClearDestination() {
    setDestination(null);
    setIsPinMode(true);
  }

  /** Fly camera back to the user's current GPS position. */
  function handleRecenter() {
    if (!userCoords) return;
    setCameraCenter([...userCoords]);
    setRecenterKey((k) => k + 1);
  }

  function handleContinue() {
    navigation?.navigate('SetAlarm');
  }

  // Recalculate distance every time the destination or user position changes
  const distanceLabel = haversineDistance(userCoords, destination);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Full-screen map ──────────────────────────────────────────────── */}
      <Map
        style={styles.map}
        mapStyle={OSM_STYLE_URL}
        logoEnabled={false}
        logoPosition={{ bottom: -100, left: -100 }}
        attributionEnabled={false}
        attributionPosition={{ bottom: -100, right: -100 }}
        compassEnabled
        compassPosition={{ bottom: 280, right: 18 }}
        onCameraChanged={handleCameraChanged}
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

        {/* Static dot marker at the confirmed destination — hidden during redo */}
        {destination && !isPinMode && (
          <View style={styles.destinationWrapper}>
            <View style={styles.destinationMarker} />
          </View>
        )}
      </Map>

      {/* ── Visual overlays (non-interactive) ───────────────────────────── */}
      <View style={styles.mapTint} pointerEvents="none" />

      <LinearGradient
        colors={['rgba(5,5,14,0.98)', 'rgba(5,5,14,0.75)', 'transparent']}
        style={styles.topFade}
        pointerEvents="none"
      />

      <LinearGradient
        colors={['transparent', 'rgba(5,5,14,0.6)', 'rgba(5,5,14,0.95)']}
        style={styles.bottomFade}
        pointerEvents="none"
      />

      {/* ── Crosshair pin — locked to screen center during pin mode ─────── */}
      {isPinMode && (
        <View style={styles.crosshairWrapper} pointerEvents="none">
          <Ionicons name="location" size={42} color={COLORS.accent} />
          <View style={styles.crosshairDot} />
        </View>
      )}

      {/* ── Confirm Pin button — floats above the bottom card in pin mode ── */}
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

      {/* ── UI overlay (header, search, recenter, bottom card) ───────────── */}
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

        {/* Transparent spacer that lets map touch events pass through */}
        <View style={styles.mapSpacer} pointerEvents="none" />

        {/* Recenter button — bottom-right, above the bottom card */}
        <View style={styles.recenterWrapper}>
          <GlassButton onPress={handleRecenter}>
            <Ionicons name="navigate" size={24} color="#FFFFFF" />
          </GlassButton>
        </View>

        <View style={styles.bottomSheet}>
          <SelectionCard
            destination={destination}
            userCoords={userCoords}
            isPinMode={isPinMode}
            distanceLabel={distanceLabel}
            onSelectDestination={handleSelectDestination}
            onClearDestination={handleClearDestination}
            onContinue={handleContinue}
          />
        </View>

      </SafeAreaView>
    </View>
  );
}


// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Layout shells ──────────────────────────────────────────────────────────

  root: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  overlay: {
    flex: 1,
  },


  // ── Map overlays ───────────────────────────────────────────────────────────

  mapTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,14,0.24)',
  },

  topFade: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    height:   100,
  },

  bottomFade: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   320,
  },


  // ── Header ─────────────────────────────────────────────────────────────────

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingBottom:     12,
  },

  headerTitle: {
    ...FONTS.cardTitle,
    color:    COLORS.textPrimary,
    fontSize: 18,
  },


  // ── Search bar ─────────────────────────────────────────────────────────────

  searchWrapper: {
    paddingHorizontal: 8,
    paddingVertical:   0,
  },

  searchCard: {
    marginTop:         14,
    paddingHorizontal: 14,
    paddingVertical:   2,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },

  searchInput: {
    flex:               1,
    fontSize:           14,
    color:              COLORS.textPrimary,
    paddingVertical:    2,
    includeFontPadding: false,
  },


  // ── Map spacer (passes touch through to the map) ───────────────────────────

  mapSpacer: {
    flex: 1,
  },


  // ── Crosshair (center of screen, pin tip at true center) ──────────────────

  crosshairWrapper: {
    position:       'absolute',
    top:            0,
    left:           0,
    right:          0,
    bottom:         0,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   42, // lift so the pin tip aligns with screen center
  },

  crosshairDot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: COLORS.accent,
    marginTop:       -4,
  },


  // ── Confirm Pin button ─────────────────────────────────────────────────────

  confirmWrapper: {
    position:  'absolute',
    bottom:    230,
    alignSelf: 'center',
  },

  confirmGradient: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    paddingVertical:   12,
    paddingHorizontal: 24,
    borderRadius:      24,
  },

  confirmLabel: {
    ...FONTS.cardButton,
    color:    '#fff',
    fontSize: 15,
  },


  // ── Recenter button ────────────────────────────────────────────────────────

  recenterWrapper: {
    alignItems:        'flex-end',
    paddingHorizontal: 18,
    paddingBottom:     12,
    marginBottom:      5,
  },


  // ── Bottom sheet ───────────────────────────────────────────────────────────

  bottomSheet: {
    paddingHorizontal: 16,
    paddingBottom:     16,
  },


  // ── Selection card ─────────────────────────────────────────────────────────

  selectionCard: {
    gap: 0,
  },

  selectionRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               22,
    paddingVertical:   12,
    borderRadius:      12,
    paddingHorizontal: 4,
  },

  // Highlight row background when pin-placement mode is active
  selectionRowActive: {
    backgroundColor:   'rgba(124,92,232,0.10)',
    marginLeft:        -8,
    marginRight:       -8,
    paddingHorizontal: 12,
  },

  selectionIconBox: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth:     1,
    borderColor:     COLORS.border,
    alignItems:      'center',
    justifyContent:  'center',
  },

  selectionText: {
    flex: 1,
    gap:  3,
  },

  selectionLabel: {
    ...FONTS.sectionLabel,
    color: COLORS.textSecondary,
  },

  selectionValue: {
    ...FONTS.cardTitle,
    color: COLORS.textPrimary,
  },

  selectionPlaceholder: {
    color: COLORS.textSecondary,
  },

  selectionDivider: {
    height:          1,
    backgroundColor: COLORS.border,
    marginVertical:  4,
    marginLeft:      48,
  },


  // ── "Placing…" badge — shown while dragging the crosshair ─────────────────

  pinModeBadge: {
    backgroundColor:   COLORS.accentSoft,
    borderWidth:       1,
    borderColor:       'rgba(124,92,232,0.4)',
    paddingHorizontal: 8,
    marginRight:       8,
    paddingVertical:   4,
    borderRadius:      8,
  },

  pinModeBadgeText: {
    ...FONTS.cardMeta,
    color: COLORS.accent,
  },


  // ── Distance pill + × redo button — shown after pin is confirmed ───────────

  destinationMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginRight:   4,
  },

  // Small pill showing straight-line distance to the destination
  distancePill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    backgroundColor:   COLORS.accentSoft,
    borderWidth:       1,
    borderColor:       'rgba(124,92,232,0.35)',
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      8,
  },

  distancePillText: {
    ...FONTS.cardMeta,
    color:    COLORS.accent,
    fontSize: 11,
  },

  // × button — tapping this clears the destination and re-enters pin mode
  redoButton: {
    width:           26,
    height:          26,
    borderRadius:    13,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth:     1,
    borderColor:     COLORS.border,
    alignItems:      'center',
    justifyContent:  'center',
  },


  // ── Continue button ────────────────────────────────────────────────────────

  continueTouchable: {
    marginTop: 8,
  },

  continueGradient: {
    alignItems:        'center',
    justifyContent:    'center',
    paddingVertical:   14,
    borderRadius:      14,
  },

  continueLabel: {
    ...FONTS.cardButton,
    color:    '#fff',
    fontSize: 15,
  },


  // ── Confirmed destination dot marker on the map ────────────────────────────

  destinationMarker: {
    width:           16,
    height:          16,
    borderRadius:    8,
    backgroundColor: '#7C5CE8',
    borderWidth:     2,
    borderColor:     '#FFFFFF',
  },

  destinationWrapper: {
    position:   'absolute',
    top:        '50%',
    left:       '50%',
    marginLeft: -8,
    marginTop:  -8,
  },

});