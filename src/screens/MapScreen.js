import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import {
  Map,
  Camera,
  UserLocation,
  PointAnnotation,
  ShapeSource,
  Layer,
  compass,
} from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import GlassButton from '../components/GlassButton';

// Constants
const OSM_STYLE_URL      = 'https://tiles.openfreemap.org/styles/dark';
const ALARM_RADIUS_M     = 300;
const CIRCLE_PIXEL_RATIO = 0.075;

// Helpers
function toCoords(location) {
  return [location.coords.longitude, location.coords.latitude];
}

function alarmRadiusShape(coordinates) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates },
  };
}

// Screen
export default function MapScreen() {
  const cameraRef                         = useRef(null);
  const [userCoords, setUserCoords]       = useState(null);
  const [destination, setDestination]     = useState(null);
  const [cameraCenter, setCameraCenter]   = useState(null);
  const [recenterKey, setRecenterKey]     = useState(0);
  const DEFAULT_CENTER                    = [125.4553, 7.1907];

  useEffect(() => {
    requestInitialLocation();
  }, []);

  async function requestInitialLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Wakely needs your location to work.');
      return;
    }

    const initial = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const coords = toCoords(initial);
    setUserCoords(coords);
    setCameraCenter(coords);
  }

  function handleLocationUpdate(location) {
    const coords = toCoords(location);
    setUserCoords(coords);
  }

  function handleLongPress(event) {
    setDestination(event.nativeEvent.coordinate);
  }

  // Re-center by updating center state + bumping key to force Camera re-fly
  function handleRecenterPress() {
    if (!userCoords) return;
    setCameraCenter([...userCoords]);
    setRecenterKey(k => k + 1);
  }

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={OSM_STYLE_URL}
        onLongPress={handleLongPress}
        logoEnabled={false}
        logoPosition={{ bottom: -100, left: -100 }}
        attributionEnabled={false}
        attributionPosition={{ bottom: -100, right: -100 }}
        compassEnabled
        compassPosition={{ bottom: 498, right: 22 }}
        compassViewMargins={{ x: 0, y: 0 }}
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

        {destination && (
          <>
            <PointAnnotation id="destination" coordinate={destination}>
              <View style={styles.destinationMarker} />
            </PointAnnotation>

            <ShapeSource id="alarmRadiusSource" shape={alarmRadiusShape(destination)}>
              <Layer
                id="alarmRadiusCircle"
                type="circle"
                paint={{
                  'circle-radius':       ALARM_RADIUS_M / CIRCLE_PIXEL_RATIO,
                  'circle-color':        'rgba(124, 92, 232, 0.15)',
                  'circle-stroke-width': 1.5,
                  'circle-stroke-color': 'rgba(124, 92, 232, 0.7)',
                }}
              />
            </ShapeSource>
          </>
        )}
      </Map>

      {/* Purple-dark tint overlay */}
      <View style={styles.mapTint} pointerEvents="none" />

      {/* Bottom-right button stack: compass sits above, recenter below */}
      <View style={styles.buttonStack} pointerEvents="box-none">
        {/* Location / recenter button */}
        <TouchableOpacity onPress={handleRecenterPress} activeOpacity={0.85}>
          <LinearGradient
            colors={['#9d6fff', '#7C5CE8', '#5c40cc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.recenterButton}
          >
            <Ionicons name="navigate" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({

  container: { flex: 1 },
  map:       { flex: 1 },

  mapTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 14, 0.24)',
  },

  destinationMarker: {
    width:           16,
    height:          16,
    borderRadius:    8,
    backgroundColor: '#7C5CE8',
    borderWidth:     2,
    borderColor:     '#FFFFFF',
  },

  // Bottom-right stack — compass is rendered by MapLibre above this
  buttonStack: {
    position:       'absolute',
    bottom:         560,
    right:           18,
    alignItems:     'center',
    gap:            10,
  },

  recenterButton: {
  width: 50,
  height: 50,
  borderRadius: 27,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 8,
  marginRight: 4,
  shadowOffset: { width: 0, height: 4 },
  elevation: 5,
},
});