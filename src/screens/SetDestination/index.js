import { Ionicons } from '@expo/vector-icons';
import {
    Camera,
    Map,
    UserLocation,
} from '@maplibre/maplibre-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../../constants/theme';
import { ScreenHeader, SearchBar, SelectionCard } from './components';
import { DEFAULT_CENTER } from './constants';
import {
    useDestination,
    useMapState,
    useRouting,
    useUserLocation,
} from './hooks/mapHooks';
import { geocodePlace, haversineDistance } from './utils/geoUtils';
import { buildMapStyle } from './utils/mapUtils';

export default function SetDestinationScreen({ navigation }) {
  const { top } = useSafeAreaInsets();

  // Screen lifecycle ref 
  const isScreenActive = useRef(true);

  // Map state 
  const {
    baseMapStyle,
    cameraCenter,
    recenterKey,
    mapCenter,
    isMountedRef,
    loadBaseMapStyle,
    flyTo,
    handleCameraChanged,
  } = useMapState();

  const mapRef    = useRef(null);
  const cameraRef = useRef(null);

  // User location 
  const { userCoords, userLocationName, requestInitialLocation, handleLocationUpdate } =
    useUserLocation({
      isScreenActive,
      onFirstFix: (coords) => flyTo(coords),
    });

  // Routing 
  const { routeCoords, isRouting, commitRouteCoords, refreshRoute } = useRouting(isMountedRef);

  // Destination 
  const { destination, destinationName, setAndTrack, clear: clearDestination } = useDestination();

  // Local UI state 
  const [isPinMode,    setIsPinMode]    = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [isSearching,  setIsSearching]  = useState(false);

  // Derived 
  const mapStyle     = useMemo(() => buildMapStyle(baseMapStyle, routeCoords, destination), [baseMapStyle, routeCoords, destination]);
  const distanceLabel = haversineDistance(userCoords, destination);

  // Init 
  useEffect(() => {
    isScreenActive.current = true;
    loadBaseMapStyle();
    requestInitialLocation();

    return () => { isScreenActive.current = false; };
  }, []);

  // Handlers 
  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await geocodePlace(searchQuery);
      if (!isScreenActive.current) return;
      if (result) flyTo(result.coords);
    } finally {
      if (isMountedRef.current) setIsSearching(false);
    }
  }

  function handleSelectDestination() {
    setIsPinMode((prev) => !prev);
  }

  async function handleConfirmPin() {
    let confirmedDestination = mapCenter;

    try {
      const map = mapRef.current;
      if (map) {
        const liveCenter = await map.getCenter();
        if (liveCenter?.length === 2) confirmedDestination = liveCenter;
      }
    } catch {
      confirmedDestination = mapCenter;
    }

    if (!confirmedDestination) return;

    const nextDestination = [...confirmedDestination];
    setAndTrack(nextDestination);
    setIsPinMode(false);
    commitRouteCoords([]);

    if (userCoords) refreshRoute(userCoords, nextDestination, { force: true });
  }

  function handleClearDestination() {
    clearDestination();
    commitRouteCoords([]);
    setIsPinMode(true);
  }

  function handleRecenter() {
    if (!userCoords) return;
    flyTo([...userCoords]);
  }

  function handleContinue() {
    navigation?.navigate('SetAlarm');
  }

  // Render 
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

        <ScreenHeader onBack={() => navigation?.goBack()} topInset={top} />

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

// Styles 
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 2,
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
    marginRight: 4,
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

  searchWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
});