import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import AlarmsScreen from '../screens/AlarmsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { FONTS } from '../constants/theme';

// Tabs Config 
const TABS = [
  {
    name: 'Home',
    label: 'Home',
    icon: 'home-outline',
    iconFocused: 'home',
    screen: HomeScreen,
  },
  {
    name: 'Map',
    label: 'Map',
    icon: 'map-outline',
    iconFocused: 'map',
    screen: MapScreen,
  },
  {
    name: 'Alarms',
    label: 'Alarms',
    icon: 'notifications-outline',
    iconFocused: 'notifications',
    screen: AlarmsScreen,
  },
  {
    name: 'Settings',
    label: 'Settings',
    icon: 'settings-outline',
    iconFocused: 'settings',
    screen: SettingsScreen,
  },
];

// Colors 
const COLORS = {
  background: '#05050e',
  active: '#7C5CE8',
  inactive: '#4A4A6A',
};

// Animated Tab Item
function TabItem({ tab, isFocused, onPress }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isFocused ? -5 : 0,
      useNativeDriver: true,
      friction: 6,
    }).start();

    Animated.spring(scale, {
      toValue: isFocused ? 1.12 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [isFocused]);

  const color = isFocused ? COLORS.active : COLORS.inactive;

  return (
    <Pressable style={styles.tabItem} onPress={onPress}>
      <Animated.View
        style={{
          transform: [
            { translateY },
            { scale },
          ],
        }}
      >
        <Ionicons
          name={isFocused ? tab.iconFocused : tab.icon}
          size={22}
          color={color}
        />
      </Animated.View>

      <Text style={[styles.label, { color }]}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

// Tab Bar 
function WakelyTabBar({ state, navigation }) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: bottom || 10 }]}>
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;

        return (
          <TabItem
            key={tab.name}
            tab={tab}
            isFocused={isFocused}
            onPress={() => {
              if (!isFocused) navigation.navigate(tab.name);
            }}
          />
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
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <WakelyTabBar {...props} />}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.screen}
        />
      ))}
    </Tab.Navigator>
  );
}

// Styles 
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 14,
    height: 85,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  label: {
    fontSize: FONTS.tabLabel?.fontSize || 12,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
});