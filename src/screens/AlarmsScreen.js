import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


export default function AlarmsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Alarm Settings</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#05050e',
  },

  text: { 
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
});