import React from 'react';
import { View, StyleSheet } from 'react-native';
import SoftActionCard from '../components/SoftActionCard';

export default function QuickActionsSection() {
  return (
    <View style={styles.container}>

      <SoftActionCard
        icon="download-outline"
        title="Download Maps"
        subtitle="Available offline"
      />

      <SoftActionCard
        icon="location-outline"
        title="My Places"
        subtitle="Saved locations"
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
    marginTop: 4,
  },
});