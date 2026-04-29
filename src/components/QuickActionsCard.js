import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import GlassCard         from './GlassCard';
import QuickActionButton from './QuickActionButton';

/**
 * Default actions — override via props if needed.
 * Each item: { icon: Ionicons name, label: string, key: string }
 */
const DEFAULT_ACTIONS = [
  { key: 'download', icon: 'download-outline', label: 'Download\nMaps' },
  { key: 'places',   icon: 'location-outline', label: 'My Places'      },
  { key: 'settings', icon: 'settings-outline', label: 'Settings'       },
  { key: 'history',  icon: 'time-outline',     label: 'History'        },
];

/**
 * QuickActionsCard
 * A row of icon + label action tiles inside a glass card.
 *
 * Props:
 *  - actions       : array  — override default actions list
 *  - onActionPress : function(item) — called with the tapped action item
 */
export default function QuickActionsCard({
  actions       = DEFAULT_ACTIONS,
  onActionPress,
}) {
  return (
    <GlassCard>
      <Text style={styles.sectionLabel}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((item) => (
          <QuickActionButton
            key={item.key}
            icon={item.icon}
            label={item.label}
            onPress={() => onActionPress?.(item)}
          />
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    ...FONTS.sectionLabel,
    color:        COLORS.textSecondary,
    marginBottom: 8,
  },

  grid: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    marginTop:     4,
  },
});