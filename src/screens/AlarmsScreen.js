import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons }              from '@expo/vector-icons';
import { COLORS, FONTS }         from '../constants/theme';
import GlassCard                 from '../components/GlassCard';
import FloatingGradientButton    from '../components/FloatingGradientButton';
import { LinearGradient }        from 'expo-linear-gradient';

// Constants 
const ALARM_RADIUS_MIN    = 100;
const ALARM_RADIUS_MAX    = 1000;
const ALARM_RADIUS_TICKS  = ['100 m', '300 m', '500 m', '1 km'];

const EARLY_WARNING_MIN   = 200;
const EARLY_WARNING_MAX   = 1000;

const ALARM_SOUND_OPTIONS = ['Rise & Shine', 'Gentle Wake', 'Radar', 'Beacon'];
const VIBRATION_OPTIONS   = ['Strong', 'Medium', 'Light', 'None'];

// Helpers 
function formatMeters(meters) {
  return meters >= 1000 ? '1 km' : `${meters} m`;
}

// Subcomponents 
// Back arrow + title + info icon.
function ScreenHeader({ title, onBack, onInfo, topInset }) {
  return (
    <View style={[styles.header, { paddingTop: topInset + 10 }]}>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity hitSlop={12} activeOpacity={0.7} onPress={onInfo}/>
    </View>
  );
}

// Evenly spaced tick labels rendered below a slider.
function SliderTicks({ ticks }) {
  return (
    <View style={styles.tickRow}>
      {ticks.map((tick) => (
        <Text key={tick} style={styles.tickLabel}>{tick}</Text>
      ))}
    </View>
  );
}

// Glass card with a slider to set the alarm trigger radius
function AlarmRadiusCard({ radius, onChange }) {
  return (
    <GlassCard>
      <Text style={styles.cardSectionLabel}>Alarm Radius</Text>

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
        Alarm will trigger when you are within {formatMeters(radius)} from destination.
      </Text>
    </GlassCard>
  );
}

// Glass card with a toggle and an optional slider for early warning distance.
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

// A plain (no card) label + value + chevron row for Sound and Vibration.
function SettingRow({ label, value, onPress }) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        <Text style={styles.settingValue}>{value}</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

// A thin separator line between plain setting rows.
function SettingDivider() {
  return <View style={styles.divider} />;
}

// Screen 
export default function AlarmsScreen({ navigation }) {
  const { top } = useSafeAreaInsets();

  const [alarmRadius,    setAlarmRadius]    = useState(300);
  const [earlyWarning,   setEarlyWarning]   = useState(true);
  const [warningRadius,  setWarningRadius]  = useState(500);
  const [alarmSound,     setAlarmSound]     = useState('Rise & Shine');
  const [vibration,      setVibration]      = useState('Strong');

  function cycleOption(options, current, setter) {
    const nextIndex = (options.indexOf(current) + 1) % options.length;
    setter(options[nextIndex]);
  }

  function handleStartTrip() {
    console.log('Trip started — radius:', alarmRadius, 'early warning:', warningRadius);
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safe} edges={['bottom']}>

        <ScreenHeader
          title="Alarm"
          topInset={top}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >

          {/* Cards — only radius and early warning */}
          <AlarmRadiusCard
            radius={alarmRadius}
            onChange={setAlarmRadius}
          />

          <EarlyWarningCard
            enabled={earlyWarning}
            radius={warningRadius}
            onToggle={setEarlyWarning}
            onRadiusChange={setWarningRadius}
          />

          {/* Plain rows — no cards */}
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

      {/* Floats above everything */}
      <FloatingGradientButton
        label="Save and Use"
        onPress={handleStartTrip}
        bottom={32}
      />

    </View>
  );
}

// Styles 
const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: COLORS.background,
  },

  safe: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 32,
    paddingBottom:     16,
    marginTop:         14,
    alignItems:    'left',
  },

  headerTitle: {
    ...FONTS.cardTitle,
    color:    COLORS.textPrimary,
    fontSize: 22,
  },

  // Scroll
  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     120,
    gap:               12,
  },

  // Shared card internals
  cardSectionLabel: {
    ...FONTS.sectionLabel,
    color:        COLORS.textSecondary,
    marginBottom: 8,
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

  // Early warning card
  earlyWarningTitleRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   4,
  },

  // Plain settings (no card)
  plainSettings: {
    marginTop: 4,
  },

  settingRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingVertical: 16,
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
});