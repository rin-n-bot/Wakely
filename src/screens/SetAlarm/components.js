import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Slider       from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Map, Camera } from '@maplibre/maplibre-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import GlassCard           from '../../components/GlassCard';

import { useMapStyle }                          from './hooks/alarmHooks';
import { buildCircleGeoJSON, buildPointGeoJSON, formatMeters } from './utils/alarmUtils';
import {
  DEFAULT_CENTER,
  MAP_FIXED_ZOOM,
  ALARM_RADIUS_MIN,
  ALARM_RADIUS_MAX,
  ALARM_RADIUS_TICKS,
  EARLY_WARNING_MIN,
  EARLY_WARNING_MAX,
} from './constants';


// ─── RadiusMap ────────────────────────────────────────────────────────────────

export function RadiusMap({ destination, radiusMeters }) {
  const baseStyle = useMapStyle();
  const center    = destination ?? DEFAULT_CENTER;

  const circleGeoJSON      = useMemo(() => buildCircleGeoJSON(center, radiusMeters), [radiusMeters]);
  const destinationGeoJSON = useMemo(() => buildPointGeoJSON(center), []);

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
      {
        id:     'alarm-circle-fill',
        type:   'fill',
        source: 'alarmCircleSource',
        paint:  { 'fill-color': 'rgba(124,92,232,0.18)', 'fill-opacity': 1 },
      },
      {
        id:     'alarm-circle-stroke',
        type:   'line',
        source: 'alarmCircleSource',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint:  { 'line-color': '#9d6fff', 'line-width': 2, 'line-opacity': 0.9, 'line-dasharray': [4, 2] },
      },
      {
        id:     'alarm-dest-halo',
        type:   'circle',
        source: 'alarmDestinationSource',
        paint:  { 'circle-radius': 16, 'circle-color': 'rgba(124,92,232,0.22)', 'circle-stroke-width': 2, 'circle-stroke-color': 'rgba(255,255,255,0.5)' },
      },
      {
        id:     'alarm-dest-body',
        type:   'circle',
        source: 'alarmDestinationSource',
        paint:  { 'circle-radius': 9, 'circle-color': COLORS.accent, 'circle-stroke-width': 2.5, 'circle-stroke-color': '#FFFFFF' },
      },
      {
        id:     'alarm-dest-center',
        type:   'circle',
        source: 'alarmDestinationSource',
        paint:  { 'circle-radius': 3, 'circle-color': '#FFFFFF' },
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
      <Camera zoom={MAP_FIXED_ZOOM} center={center} animationMode="none" />
    </Map>
  );
}

const mapStyles = StyleSheet.create({
  map: {
    width: '100%', height: 200, borderRadius: 14,
    overflow: 'hidden', marginTop: 12, marginBottom: 24,
  },
  placeholder: {
    width: '100%', height: 200, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 12, marginBottom: 16,
  },
});


// ─── ScreenHeader ─────────────────────────────────────────────────────────────

export function ScreenHeader({ onBack, topInset }) {
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


// ─── SliderTicks ──────────────────────────────────────────────────────────────

export function SliderTicks({ ticks }) {
  return (
    <View style={styles.tickRow}>
      {ticks.map((tick) => (
        <Text key={tick} style={styles.tickLabel}>{tick}</Text>
      ))}
    </View>
  );
}


// ─── AlarmRadiusCard ──────────────────────────────────────────────────────────

export function AlarmRadiusCard({ radius, onChange, destination }) {
  return (
    <GlassCard>
      <Text style={styles.cardSectionLabel}>Alarm Radius</Text>
      <RadiusMap destination={destination} radiusMeters={radius} />
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


// ─── EarlyWarningCard ─────────────────────────────────────────────────────────

export function EarlyWarningCard({ enabled, radius, onToggle, onRadiusChange }) {
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


// ─── SettingRow / SettingDivider ──────────────────────────────────────────────

export function SettingRow({ label, value, onPress }) {
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

export function SettingDivider() {
  return <View style={styles.divider} />;
}


// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  headerTitle: {
    ...FONTS.cardTitle, color: COLORS.textPrimary, fontSize: 18,
  },
  cardSectionLabel: {
    ...FONTS.sectionLabel, color: COLORS.textSecondary, marginBottom: 4,
  },
  sliderCurrentValue: {
    ...FONTS.cardTitle, color: COLORS.textPrimary, fontSize: 22, fontWeight: '700',
  },
  slider: {
    width: '100%', height: 40, marginTop: 4,
  },
  tickRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 2,
  },
  tickLabel: {
    ...FONTS.cardMeta, color: COLORS.textSecondary, fontSize: 11,
  },
  hintText: {
    ...FONTS.cardMeta, color: COLORS.textSecondary, marginTop: 10, lineHeight: 18,
  },
  earlyWarningTitleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12,
  },
  settingLabel: {
    ...FONTS.cardTitle, color: COLORS.textPrimary,
  },
  settingRight: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  settingValue: {
    ...FONTS.cardMeta, color: COLORS.textSecondary,
  },
  divider: {
    height: 1, backgroundColor: COLORS.border,
  },
});