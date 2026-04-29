import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';

/**
 * QuickActionButton
 * A single icon + label action tile used inside QuickActionsCard.
 *
 * Props:
 *  - icon     : string   — Ionicons name
 *  - label    : string   — supports '\n' for two-line labels
 *  - onPress  : function
 */
export default function QuickActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.col}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={COLORS.textPrimary} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  col: {
    flex:       1,
    alignItems: 'center',
    gap:        8,
  },

  iconBox: {
    width:           52,
    height:          52,
    borderRadius:    13,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth:     1,
    borderColor:     COLORS.border,
    alignItems:      'center',
    justifyContent:  'center',
  },

  label: {
    ...FONTS.actionLabel,
    color:     COLORS.textPrimary,
    textAlign: 'center',
  },
});