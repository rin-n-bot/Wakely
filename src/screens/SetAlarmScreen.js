import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Slider                    from '@react-native-community/slider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }              from '@expo/vector-icons';
import { LinearGradient }        from 'expo-linear-gradient';
import { Map, Camera }           from '@maplibre/maplibre-react-native';
import { COLORS, FONTS }         from '../constants/theme';
import GlassCard                 from '../components/GlassCard';
import FloatingGradientButton    from '../components/FloatingGradientButton';


// ─── Constants ────────────────────────────────────────────────────────────────

const OSM_STYLE_URL      = 'https://tiles.openfreemap.org/styles/dark';
const DEFAULT_CENTER     = [125.4553, 7.1907];

// Camera is fixed — never zooms or pans when slider moves
const MAP_FIXED_ZOOM     = 14;

const ALARM_RADIUS_MIN   = 100;
const ALARM_RADIUS_MAX   = 1000;
const ALARM_RADIUS_TICKS = ['100 m', '300 m', '500 m', '1 km'];

const EARLY_WARNING_MIN  = 200;
const EARLY_WARNING_MAX  = 1000;

const ALARM_SOUND_OPTIONS = ['Rise & Shine', 'Gentle Wake', 'Radar', 'Beacon'];
const VIBRATION_OPTIONS   = ['Strong', 'Medium', 'Light', 'None'];

const METERS_PER_DEG_LAT = 110540;


// ─── Utilities ────────────────────────────────────────────────────────────────

function formatMeters(meters) {
  return meters >= 1000 ? '1 km' : `${meters} m`;
}

/**
 * Build a GeoJSON circle polygon around [lon, lat] with radius in meters.
 * Only this GeoJSON changes when the slider moves — the camera stays locked.
 */
function buildCircleGeoJSON(centerCoords, radiusMeters, steps = 64) {
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

function buildPointGeoJSON(coords) {
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


// ─── Radius Map ───────────────────────────────────────────────────────────────

/**
 * Static map — camera mounts once and never moves.
 * Only the circle GeoJSON polygon data updates when radiusMeters changes.
 */
function RadiusMap({ destination, radiusMeters }) {
  const [baseStyle, setBaseStyle] = useState(null);

  const center = destination ?? DEFAULT_CENTER;

  useEffect(() => {
    let cancelled = false;
    fetch(OSM_STYLE_URL)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setBaseStyle(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // circleGeoJSON re-computes only when radiusMeters changes
  const circleGeoJSON = useMemo(
    () => buildCircleGeoJSON(center, radiusMeters),
    [radiusMeters],
  );

  // destinationGeoJSON is stable — center never changes after mount
  const destinationGeoJSON = useMemo(
    () => buildPointGeoJSON(center),
    [],
  );

  if (!baseStyle) {
    return (
      <View style={mapStyles.placeholder}>
        <ActivityIndicator size="small" color={COLORS.accent} />
      </View>
    );
  }

  const mapStyle = {
    ...baseStyle,
    sources: {
      ...baseStyle.sources,
      alarmCircleSource:      { type: 'geojson', data: circleGeoJSON },
      alarmDestinationSource: { type: 'geojson', data: destinationGeoJSON },
    },
    layers: [
      ...(baseStyle.layers ?? []),
      // Circle fill
      {
        id:     'alarm-circle-fill',
        type:   'fill',
        source: 'alarmCircleSource',
        paint: {
          'fill-color':   'rgba(124,92,232,0.18)',
          'fill-opacity': 1,
        },
      },
      // Circle dashed stroke ring
      {
        id:     'alarm-circle-stroke',
        type:   'line',
        source: 'alarmCircleSource',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color':     '#9d6fff',
          'line-width':     2,
          'line-opacity':   0.9,
          'line-dasharray': [4, 2],
        },
      },
      // Destination halo
      {
        id:     'alarm-dest-halo',
        type:   'circle',
        source: 'alarmDestinationSource',
        paint: {
          'circle-radius':       16,
          'circle-color':        'rgba(124,92,232,0.22)',
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        },
      },
      // Destination body
      {
        id:     'alarm-dest-body',
        type:   'circle',
        source: 'alarmDestinationSource',
        paint: {
          'circle-radius':       9,
          'circle-color':        COLORS.accent,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#FFFFFF',
        },
      },
      // Destination center dot
      {
        id:     'alarm-dest-center',
        type:   'circle',
        source: 'alarmDestinationSource',
        paint: {
          'circle-radius': 3,
          'circle-color':  '#FFFFFF',
        },
      },
    ],
  };

  return (
    <Map
      style={mapStyles.map}
      mapStyle={mapStyle}
      logoEnabled={false}
      logoPosition={{ bottom: -100, left: -100 }}
      attributionEnabled={false}
      attributionPosition={{ bottom: -100, right: -100 }}
      compassEnabled={false}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      {/*
        No `key` prop → Camera mounts exactly once.
        animationMode="none" → no animation, no movement at all.
        The map is fully static; only GeoJSON data in the style changes.
      */}
      <Camera
        zoom={MAP_FIXED_ZOOM}
        center={center}
        animationMode="none"
      />
    </Map>
  );
}

const mapStyles = StyleSheet.create({
  map: {
    width:        '100%',
    height:       200,
    borderRadius: 14,
    overflow:     'hidden',
    marginTop:    12,
    marginBottom: 24,
  },
  placeholder: {
    width:           '100%',
    height:          200,
    borderRadius:    14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       12,
    marginBottom:    16,
  },
});


// ─── Subcomponents ────────────────────────────────────────────────────────────

function ScreenHeader({ onBack, topInset }) {
  // Fixed: use array syntax so the dynamic paddingTop merges correctly
  return (
    <View style={[styles.header, { paddingTop: topInset + 10 }]}>
      <TouchableOpacity hitSlop={12} activeOpacity={0.7} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Set Alarm</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

function SliderTicks({ ticks }) {
  return (
    <View style={styles.tickRow}>
      {ticks.map((tick) => (
        <Text key={tick} style={styles.tickLabel}>{tick}</Text>
      ))}
    </View>
  );
}

/**
 * AlarmRadiusCard — map preview at the top, then value + slider below.
 * No legend.
 */
function AlarmRadiusCard({ radius, onChange, destination }) {
  return (
    <GlassCard>
      <Text style={styles.cardSectionLabel}>Alarm Radius</Text>

      {/* Live map preview — static camera, animated circle only */}
      <RadiusMap destination={destination} radiusMeters={radius} />

      {/* Current value */}
      <Text style={styles.sliderCurrentValue}>{formatMeters(radius)}</Text>

      <Slider
        style={styles.slider}
        minimumValue={ALARM_RADIUS_MIN}
        maximumValue={ALARM_RADIUS_MAX}
        step={50}
        value={radius}
        onValueChange={onChange}
        minimumTrackTintColor={COLORS.accent}
        maximumTrackTintColor="rgba(255,255,255,0.1)"
        thumbTintColor={COLORS.accent}
      />

      <SliderTicks ticks={ALARM_RADIUS_TICKS} />

      <Text style={styles.hintText}>
        Alarm will trigger when you are within {formatMeters(radius)} of your destination.
      </Text>
    </GlassCard>
  );
}

function EarlyWarningCard({ enabled, radius, onToggle, onRadiusChange }) {
  return (
    <GlassCard>
      <View style={styles.earlyWarningTitleRow}>
        <Text style={styles.cardSectionLabel}>Early Warning</Text>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.accent }}
          thumbColor={COLORS.textPrimary}
        />
      </View>

      <Text style={styles.sliderCurrentValue}>{formatMeters(radius)}</Text>

      {enabled && (
        <>
          <Slider
            style={styles.slider}
            minimumValue={EARLY_WARNING_MIN}
            maximumValue={EARLY_WARNING_MAX}
            step={50}
            value={radius}
            onValueChange={onRadiusChange}
            minimumTrackTintColor={COLORS.accent}
            maximumTrackTintColor="rgba(255,255,255,0.1)"
            thumbTintColor={COLORS.accent}
          />
          <Text style={styles.hintText}>
            Get a heads up when you are {formatMeters(radius)} away.
          </Text>
        </>
      )}
    </GlassCard>
  );
}

function SettingRow({ label, value, onPress }) {
  return (
    <TouchableOpacity style={styles.settingRow} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        <Text style={styles.settingValue}>{value}</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

function SettingDivider() {
  return <View style={styles.divider} />;
}


// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SetAlarmScreen({ navigation, route }) {
  const { top } = useSafeAreaInsets();

  const destination = route?.params?.destination ?? null;

  const [alarmRadius,   setAlarmRadius]   = useState(300);
  const [earlyWarning,  setEarlyWarning]  = useState(true);
  const [warningRadius, setWarningRadius] = useState(500);
  const [alarmSound,    setAlarmSound]    = useState('Rise & Shine');
  const [vibration,     setVibration]     = useState('Strong');

  function cycleOption(options, current, setter) {
    const nextIndex = (options.indexOf(current) + 1) % options.length;
    setter(options[nextIndex]);
  }

  function handleSaveAlarm() {
    console.log('Alarm saved —', { destination, alarmRadius, earlyWarning, warningRadius, alarmSound, vibration });
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safe} edges={['bottom']}>

        <ScreenHeader onBack={() => navigation?.goBack()} topInset={top} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <AlarmRadiusCard
            radius={alarmRadius}
            onChange={setAlarmRadius}
            destination={destination}
          />

          <EarlyWarningCard
            enabled={earlyWarning}
            radius={warningRadius}
            onToggle={setEarlyWarning}
            onRadiusChange={setWarningRadius}
          />

          <View style={styles.plainSettings}>
            <SettingRow
              label="Alarm Sound"
              value={alarmSound}
              onPress={() => cycleOption(ALARM_SOUND_OPTIONS, alarmSound, setAlarmSound)}
            />
            <SettingDivider />
            <SettingRow
              label="Vibration"
              value={vibration}
              onPress={() => cycleOption(VIBRATION_OPTIONS, vibration, setVibration)}
            />
          </View>
        </ScrollView>

      </SafeAreaView>

                 {/* Bottom fade — blends map into navbar */}
                  <LinearGradient
                    colors={['transparent', 'rgba(5,5,14,0.75)', 'rgba(5,5,14,0.98)']}
                    style={styles.bottomFade}
                    pointerEvents="none"
                  />

      <FloatingGradientButton label="Start the trip" onPress={handleSaveAlarm} bottom={32} />
    </View>
  );
}


// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  root: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  safe: {
    flex: 1,
  },

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

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     120,
    gap:               12,
  },

  cardSectionLabel: {
    ...FONTS.sectionLabel,
    color:        COLORS.textSecondary,
    marginBottom: 4,
  },

  sliderCurrentValue: {
    ...FONTS.cardTitle,
    color:      COLORS.textPrimary,
    fontSize:   22,
    fontWeight: '700',
  },

  slider: {
    width:     '100%',
    height:    40,
    marginTop: 4,
  },

  tickRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      2,
  },

  tickLabel: {
    ...FONTS.cardMeta,
    color:    COLORS.textSecondary,
    fontSize: 11,
  },

  hintText: {
    ...FONTS.cardMeta,
    color:      COLORS.textSecondary,
    marginTop:  10,
    lineHeight: 18,
  },

  earlyWarningTitleRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   4,
  },

  plainSettings: {
    marginTop: 4,
  },

  settingRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingVertical:   16,
    paddingHorizontal: 12,
  },

  settingLabel: {
    ...FONTS.cardTitle,
    color: COLORS.textPrimary,
  },

  settingRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },

  settingValue: {
    ...FONTS.cardMeta,
    color: COLORS.textSecondary,
  },

  divider: {
    height:          1,
    backgroundColor: COLORS.border,
  },

      bottomFade: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   100,   // adjust to taste
  },

});