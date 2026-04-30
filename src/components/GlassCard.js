import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

/**
 * GlassCard
 * Simulates a dark glassmorphism card with:
 *  - Semi-transparent dark background
 *  - Subtle outer border to define edges
 *  - Inner top-left shine via LinearGradient overlay
 *  - Soft shadow for depth
 *
 * Props:
 *  - style    : override container style
 *  - children : any content
 */
export default function GlassCard({ children, style }) {
  return (
    <View style={[styles.shadow, style]}>
      <View style={styles.card}>

        {/* Inner shine overlay — top-left bright, fades to bottom-right */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.08)',
            'rgba(255,255,255,0.01)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  // Outer shell carries the shadow so it doesn't get clipped by overflow:hidden
  shadow: {
    borderRadius:  18,
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius:  16,
    elevation:     10,
  },

  card: {
    borderRadius:    18,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.10)',
    borderTopColor:  'rgba(255,255,255,0.14)',
    borderLeftColor: 'rgba(255,255,255,0.13)',
    backgroundColor: 'rgba(20,22,45,0.75)',
    padding:         18,
    overflow:        'hidden',
  },

});