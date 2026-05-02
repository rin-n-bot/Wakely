import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SetAlarmScreen from '../screens/SetAlarm';
import SetDestinationScreen from '../screens/SetDestination';
import RootNavigator from './RootNavigator';

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