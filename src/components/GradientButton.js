import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';

/**
 * GradientButton
 * A full-width purple gradient CTA button.
 * Used for primary actions like "Set New Destination".
 *
 * Props:
 *  - label    : string  — button text
 *  - icon     : string  — Ionicons name (optional)
 *  - onPress  : function
 *  - style    : override touchable style
 */
export default function GradientButton({ label, icon, onPress, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={[styles.touchable, style]}
      onPress={onPress}
    >
      <LinearGradient
        colors={['#9d6fff', '#7C5CE8', '#5c40cc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {icon && (
          <Ionicons name={icon} size={20} color={COLORS.textPrimary} />
        )}
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginTop:    16,
    borderRadius: 12,
    overflow:     'hidden',
  },

  gradient: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 15,
    gap:             6,
  },

  label: {
    ...FONTS.cardButton,
    color: COLORS.textPrimary,
  },
});