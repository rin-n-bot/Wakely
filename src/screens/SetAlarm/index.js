import React from 'react';
import { View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient }                  from 'expo-linear-gradient';
import { COLORS }                          from '../../constants/theme';
import FloatingGradientButton              from '../../components/FloatingGradientButton';

import { useAlarmState }   from './hooks/alarmHooks';
import { cycleOption }     from './utils/alarmUtils';
import {
  ALARM_SOUND_OPTIONS,
  VIBRATION_OPTIONS,
} from './constants';
import {
  ScreenHeader,
  AlarmRadiusCard,
  EarlyWarningCard,
  SettingRow,
  SettingDivider,
} from './components';


export default function SetAlarmScreen({ navigation, route }) {
  const { top } = useSafeAreaInsets();
  const destination = route?.params?.destination ?? null;

  const {
    alarmRadius,   setAlarmRadius,
    earlyWarning,  setEarlyWarning,
    warningRadius, setWarningRadius,
    alarmSound,    setAlarmSound,
    vibration,     setVibration,
  } = useAlarmState();

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

      <LinearGradient
        colors={['transparent', 'rgba(5,5,14,0.75)', 'rgba(5,5,14,0.98)']}
        style={styles.bottomFade}
        pointerEvents="none"
      />

      <FloatingGradientButton label="Start the trip" onPress={handleSaveAlarm} bottom={32} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 2,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     120,
    gap:               18,
  },
  plainSettings: {
    marginTop: 4,
  },
  bottomFade: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   100,
  },
});