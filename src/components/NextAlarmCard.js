import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';

export default function NextAlarmCard({
  destination = '—',
  radius = 300,
  status = 'Inactive',
  onPress,
}) {
  return (
    <GlassCard>
      <View style={styles.topRow}>

        {/* left info section */}
        <View style={styles.info}>
          <Text style={styles.label}>Next Alarm</Text>
          <Text style={styles.destination}>{destination}</Text>
          <Text style={styles.meta}>Radius: {radius} m</Text>
          <View style={styles.statusRow}>
            <Ionicons
              name="ellipse-outline"
              size={11}
              color={COLORS.textSecondary}
            />
            <Text style={[styles.meta, styles.statusText]}>
              Status: {status}
            </Text>
          </View>
        </View>

        {/* right icon */}
        <View style={styles.iconBubble}>
          <Ionicons
            name="alarm-outline"
            size={26}
            color={COLORS.textPrimary}
          />
        </View>

      </View>

      <GradientButton
        label="Set New Destination"
        icon="add"
        onPress={onPress}
      />

    </GlassCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  info: {
    flex: 1,
    gap: 4,
  },

  label: {
    ...FONTS.sectionLabel,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },

  destination: {
    ...FONTS.cardTitle,
    color: COLORS.textPrimary,
  },

  meta: {
    ...FONTS.cardMeta,
    color: COLORS.textSecondary,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusText: {
    marginLeft: 4,
  },

  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(124,92,232,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
});