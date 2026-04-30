import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../constants/theme';

/**
 * FloatingGradientButton
 * A full-width gradient button that floats above content via absolute positioning.
 * Different from GradientButton which is inline inside a card.
 *
 * Props:
 *  - label   : string
 *  - onPress : function
 *  - bottom  : number  — distance from bottom (default 32)
 *  - style   : override touchable style
 */
export default function FloatingGradientButton({ label, onPress, bottom = 32, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={[styles.touchable, { bottom }, style]}
      onPress={onPress}
    >
      <LinearGradient
        colors={['#9d6fff', '#7C5CE8', '#5c40cc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    position:          'absolute',
    left:              16,
    right:             16,
    borderRadius:      14,
    overflow:          'hidden',
  },

  gradient: {
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 17,
  },

  label: {
    ...FONTS.cardButton,
    color:    COLORS.textPrimary,
    fontSize: 16,
  },
});