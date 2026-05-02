import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GlassButton({ onPress, children, style }) {
  return (
    <TouchableOpacity
      hitSlop={12}
      activeOpacity={0.7}
      style={[styles.shadow, style]}
      onPress={onPress}
    >

      {/* shine effect */}
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
  shadow: {
    borderRadius: 10,
    padding: 11,
    backgroundColor: 'rgba(20,22,45,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderTopColor: 'rgba(0, 0, 0, 0.14)',
    borderLeftColor: 'rgba(0, 0, 0, 0.13)',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,

    overflow: 'hidden',
  },
});