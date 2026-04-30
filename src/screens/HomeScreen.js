import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import { ImageBackground } from 'react-native';

// Data 
const QUICK_ACTIONS = [
  { icon: 'download-outline', label: 'Download\nMaps' },
  { icon: 'location-outline', label: 'My Places'      },
  { icon: 'settings-outline', label: 'Settings'       },
  { icon: 'time-outline',     label: 'History'        },
];

// Floating Buttons 
function FloatingHeader() {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.floatingHeader, { top: top + 10 }]}>

      <TouchableOpacity hitSlop={12} activeOpacity={0.7} style={styles.floatButton}>
        <View style={styles.burgerLines}>
          <View style={styles.burgerLine} />
          <View style={styles.burgerLine} />
          <View style={styles.burgerLine} />
        </View>
      </TouchableOpacity>

      <Text style={styles.appName}>wakely</Text>

      <TouchableOpacity hitSlop={12} activeOpacity={0.7} style={styles.floatButton}>
        <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

    </View>
  );
}

// Hero
function Hero() {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.hero, { paddingTop: top + 60 }]}>
      <View style={styles.heroTextBlock}>
        <Text style={styles.heroGreeting}>Good night,</Text>
        <Text style={styles.heroName}>Traveler </Text>
        <Text style={styles.heroSubtitle}>
          Sleep well, we'll wake you up{'\n'}at the right place.
        </Text>
      </View>
    </View>
  );
}

// Next Alarm Card 
function NextAlarmCard({ navigation }) {
  return (
    <GlassCard style={{ marginTop: 80 }}>
      <View style={styles.alarmTopRow}>
        <View style={styles.alarmInfoBlock}>
          <Text style={styles.cardSectionLabel}>Next Alarm</Text>
          <Text style={styles.alarmDestination}>Carmen, Davao del Norte</Text>
          <Text style={styles.alarmMeta}>Radius: 300 m</Text>
          <View style={styles.alarmStatusRow}>
            <Ionicons name="ellipse-outline" size={11} color={COLORS.textSecondary} />
            <Text style={[styles.alarmMeta, { marginLeft: 4 }]}>Status: Inactive</Text>
          </View>
        </View>

        <View style={styles.clockBubble}>
          <Ionicons name="alarm-outline" size={26} color={COLORS.textPrimary} />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.82}
        style={styles.ctaTouchable}
        onPress={() => navigation.getParent()?.navigate('SetDestination')}
      >
        <LinearGradient
          colors={['#9d6fff', '#7C5CE8', '#5c40cc']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ctaGradient}
        >
          <Ionicons name="add" size={20} color={COLORS.textPrimary} />
          <Text style={styles.ctaLabel}>Set New Destination</Text>
        </LinearGradient>
      </TouchableOpacity>
    </GlassCard>
  );
}

// Quick Actions Card 
function QuickActionsCard() {
  return (
    <GlassCard>
      <Text style={styles.cardSectionLabel}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {QUICK_ACTIONS.map((item) => (
          <TouchableOpacity key={item.label} style={styles.actionCol} activeOpacity={0.7}>
            <View style={styles.actionIconBox}>
              <Ionicons name={item.icon} size={22} color={COLORS.textPrimary} />
            </View>
            <Text style={styles.actionLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </GlassCard>
  );
}

// Screen component
export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../../assets/images/hero-bg.png')}
      style={styles.root}
      resizeMode="cover"
      imageStyle={{ transform: [{ translateY: -30 }] }}
    >

      <LinearGradient
        colors={[
          'transparent',
          'rgba(5,5,14,0.5)',
          'rgba(5,5,14,0.85)',
          'rgba(5,5,14,0.98)',
        ]}
        locations={[0, 0.35, 0.65, 1]}
        style={styles.imageTint}
        pointerEvents="none"
      />

      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Hero />
          <View style={styles.body}>
            <NextAlarmCard navigation={navigation} />
            <QuickActionsCard />
          </View>
        </ScrollView>
      </SafeAreaView>

      <FloatingHeader />

      <LinearGradient
        colors={['rgba(5,5,14,0.98)', 'rgba(5,5,14,0.75)', 'transparent']}
        style={styles.topFade}
        pointerEvents="none"
      />

    </ImageBackground>
  );
}

// Styles 
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  imageTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 14, 0.8)',
    zIndex: 0,
  },

  safe: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 50,
  },

  floatingHeader: {
    position:          'absolute',
    left:              0,
    right:             0,
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: 25,
    paddingTop:        10,
    zIndex:            10,
  },

  appName: {
    fontSize:      22,
    fontWeight:    '700',
    letterSpacing: 1,
    color:         COLORS.accent,
  },

  burgerLines: {
    gap: 6,
  },

  burgerLine: {
    width:           23,
    height:          2,
    borderRadius:    2,
    backgroundColor: COLORS.textPrimary,
  },

  hero: {
    width:          '100%',
    height:         280,
    justifyContent: 'flex-end',
    paddingBottom:  20,
  },

  heroTextBlock: {
    paddingHorizontal: 25,
  },

  heroGreeting: {
    ...FONTS.heroGreeting,
    color: COLORS.textPrimary,
  },

  heroName: {
    ...FONTS.heroName,
    color:     COLORS.textPrimary,
    marginTop: 2,
  },

  heroSubtitle: {
    ...FONTS.heroSubtitle,
    color:     COLORS.textSecondary,
    marginTop: 6,
  },

  body: {
    paddingHorizontal: 16,
    paddingTop:        14,
    gap:               12,
  },

  cardSectionLabel: {
    ...FONTS.sectionLabel,
    color:        COLORS.textSecondary,
    marginBottom: 8,
  },

  alarmTopRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },

  alarmInfoBlock: {
    flex: 1,
    gap:  4,
  },

  alarmDestination: {
    ...FONTS.cardTitle,
    color: COLORS.textPrimary,
  },

  alarmMeta: {
    ...FONTS.cardMeta,
    color: COLORS.textSecondary,
  },

  alarmStatusRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginTop:     2,
  },

  clockBubble: {
    width:           52,
    height:          52,
    borderRadius:    26,
    backgroundColor: COLORS.accentSoft,
    borderWidth:     1,
    borderColor:     'rgba(124,92,232,0.35)',
    alignItems:      'center',
    justifyContent:  'center',
    marginLeft:      14,
  },

  ctaTouchable: {
    marginTop:    16,
    borderRadius: 12,
    overflow:     'hidden',
  },

  ctaGradient: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 15,
    gap:             6,
  },

  ctaLabel: {
    ...FONTS.cardButton,
    color: COLORS.textPrimary,
  },

  actionsGrid: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    marginTop:     4,
  },

  actionCol: {
    flex:       1,
    alignItems: 'center',
    gap:        8,
  },

  actionIconBox: {
    width:           52,
    height:          52,
    borderRadius:    13,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth:     1,
    borderColor:     COLORS.border,
    alignItems:      'center',
    justifyContent:  'center',
  },

  actionLabel: {
    ...FONTS.actionLabel,
    color:     COLORS.textPrimary,
    textAlign: 'center',
  },

  topFade: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    height:   100,
  },
});