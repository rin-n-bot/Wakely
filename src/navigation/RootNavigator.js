import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import AlarmsScreen from '../screens/AlarmsScreen';
import SettingsScreen from '../screens/SettingsScreen';


// Constants
const COLORS = {
  background: '#05050e',
  border:     '#2c2c53',
  active:     '#FFFFFF',
  inactive:   '#4A4A6A',
  accent:     '#7C5CE8',
};

const TABS = [
  { name: 'Home',     label: 'Home',     icon: 'home-outline',          iconFocused: 'home',          screen: HomeScreen     },
  { name: 'Map',      label: 'Map',      icon: 'map-outline',           iconFocused: 'map',           screen: MapScreen      },
  { name: 'Alarms',   label: 'Alarms',   icon: 'notifications-outline', iconFocused: 'notifications', screen: AlarmsScreen   },
  { name: 'Settings', label: 'Settings', icon: 'settings-outline',      iconFocused: 'settings',      screen: SettingsScreen },
];


// Tab Bar
function WakelyTabBar({ state, navigation }) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: bottom || 8 }]}>
      {TABS.map((tab, index) => {
        const focused = state.index === index;
        const color   = focused ? COLORS.active : COLORS.inactive;

        return (
          <Pressable
            key={tab.name}
            style={styles.tabItem}
            onPress={() => !focused && navigation.navigate(tab.name)}
            android_ripple={null}
          >
            {focused && <View style={styles.activeLine} />}
            <Ionicons
              name={focused ? tab.iconFocused : tab.icon}
              size={24}
              color={color}
            />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}


// Navigator
const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <WakelyTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.screen} />
      ))}
    </Tab.Navigator>
  );
}


// Styles
const styles = StyleSheet.create({
  tabBar: {
    flexDirection:   'row',
    backgroundColor: COLORS.background,
    borderTopWidth:  2,
    borderTopColor:  COLORS.border,
    height:          84,
    alignItems:      'center',
  },
  tabItem: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     12,
    gap:            4,
  },
  activeLine: {
    position:        'absolute',
    top:             0,
    width:           32,
    height:          2,
    borderRadius:    1,
    backgroundColor: COLORS.accent,
  },
  label: {
    fontSize:      11,
    fontWeight:    '600',
    letterSpacing: 0.3,
  },
  
});