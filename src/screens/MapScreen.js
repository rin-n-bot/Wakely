import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Map, Camera, UserLocation, PointAnnotation, ShapeSource, Layer } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';


// Constants
const OSM_STYLE_URL      = 'https://tiles.openfreemap.org/styles/positron';
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
  const cameraRef                     = useRef(null);
  const [userCoords, setUserCoords]   = useState(null);
  const [destination, setDestination] = useState(null);
  const [cameraMoved, setCameraMoved] = useState(false);
  const DEFAULT_CENTER                = [125.4553, 7.1907]; 

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
    setUserCoords(toCoords(initial));
  }

  function handleLocationUpdate(location) {
    setUserCoords(toCoords(location));
  }

  function handleLongPress(event) {
    setDestination(event.nativeEvent.coordinate);
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
      >
        <Camera
          ref={cameraRef}
          zoom={14}
          center={userCoords ?? DEFAULT_CENTER}
          animationMode={userCoords ? 'flyTo' : 'none'}
          animationDuration={500}
          onUserTrackingModeChange={() => setCameraMoved(true)}
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
    </View>
  );
}


// Styles
const styles = StyleSheet.create({
  
  container: { flex: 1 },
  map:       { flex: 1 },

  destinationMarker: {
    width:           16,
    height:          16,
    borderRadius:    8,
    backgroundColor: '#7C5CE8',
    borderWidth:     2,
    borderColor:     '#FFFFFF',
  },
  
});