import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

/**
 * GlassButton
 * A reusable frosted-glass icon button.
 * Matches GlassCard's glassmorphism style — shadow shell + inner shine overlay.
 *
 * Props:
 *  - onPress  : function
 *  - style    : override shadow shell style
 *  - children : icon or any content
 */
export default function GlassButton({ onPress, children, style }) {
  return (
    <TouchableOpacity
      hitSlop={12}
      activeOpacity={0.7}
      style={[styles.shadow, style]}
      onPress={onPress}
    >
      {/* Inner shine overlay — top-left bright, fades to bottom-right */}
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.04)',
          'rgba(255,255,255,0.01)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

  // Outer shell carries shadow — mirrors GlassCard's shadow shell
  shadow: {
    borderRadius:    10,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.10)',
    borderTopColor:  'rgba(255,255,255,0.12)',
    borderLeftColor: 'rgba(255,255,255,0.11)',
    backgroundColor: 'rgba(20,22,45,0.75)',
    padding:         11,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.45,
    shadowRadius:    16,
    elevation:       10,
    overflow:        'hidden',
  },

});