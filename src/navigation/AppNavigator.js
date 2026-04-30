import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RootNavigator        from './RootNavigator';
import SetDestinationScreen from '../screens/SetDestinationScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"           component={RootNavigator}       />
      <Stack.Screen name="SetDestination" component={SetDestinationScreen} />
    </Stack.Navigator>
  );
}