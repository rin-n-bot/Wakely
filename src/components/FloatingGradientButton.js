import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../constants/theme';

export default function FloatingGradientButton({
  label,
  onPress,
  bottom = 32,
  style,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.container, { bottom }, style]}
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
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },

  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
  },

  label: {
    ...FONTS.cardButton,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
});