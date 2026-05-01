import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GlassCard({ children, style }) {
  return (
    <View style={[styles.shadowWrapper, style]}>
      <View style={styles.cardContainer}>

        {/* light shine effect */}
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
      </View>
    </View>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  // outer shadow only
  shadowWrapper: {
    borderRadius: RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },

  // main card style
  cardContainer: {
    borderRadius: RADIUS,
    overflow: 'hidden',

    backgroundColor: 'rgba(20,22,45,0.75)',

    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderTopColor: 'rgba(0,0,0,0.14)',
    borderLeftColor: 'rgba(0,0,0,0.13)',

    padding: 18,
  },
});