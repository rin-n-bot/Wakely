import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RootNavigator from './RootNavigator';
import SetDestinationScreen from '../screens/SetDestinationScreen';
import SetAlarmScreen from '../screens/SetAlarmScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* main tabs */}
      <Stack.Screen
        name="Tabs"
        component={RootNavigator}
      />

      {/* destination setup */}
      <Stack.Screen
        name="SetDestination"
        component={SetDestinationScreen}
      />

      {/* alarm setup */}
      <Stack.Screen
        name="SetAlarm"
        component={SetAlarmScreen}
      />

    </Stack.Navigator>
  );
}