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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import QuickActionsSection from '../sections/QuickActionsSection';

import MaskedView from '@react-native-masked-view/masked-view';

// Floating Buttons 
function Header() {
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: top + 28 }]}>
      
      <MaskedView
        maskElement={<Text style={styles.appNameMask}>wakely</Text>}
      >
        <LinearGradient
          colors={[
            '#6D28D9',
            '#8B5CF6',
            '#A78BFA',
            '#D8B4FE',
            '#F5EFFF',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.appNameMask, { opacity: 0 }]}>
            wakely
          </Text>
        </LinearGradient>
      </MaskedView>

      <View style={{ flex: 1 }} />

      <TouchableOpacity hitSlop={12} activeOpacity={0.7}>
        <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>

    </View>
  );
}

// Hero
function Hero() {

  return (
    <View style={styles.hero}>
      <View style={styles.heroTextBlock}>
        <Text style={styles.heroTitle}>
          Hello,{'\n'}
          Kaxandra
        </Text>
      </View>
    </View>
  );
}

// Next Alarm Card 
function NextAlarmCard({ navigation }) {
  return (
    <GlassCard style={{ marginTop: 20 }}>
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
    </GlassCard>
  );
}

// Recent Destinations (empty state)
function RecentDestinations() {
  return (
    <View style={styles.recentSection}>

      {/* Header row */}
      <View style={styles.recentHeader}>
        <Text style={styles.recentLabel}>Recent Destinations</Text>

        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Empty state */}
      <View style={styles.emptyState}>
        <Ionicons name="time-outline" size={24} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>None</Text>
        <Text style={styles.emptySubtitle}>
          Your recent destinations will appear here
        </Text>
      </View>

    </View>
  );
}

// Screen component
export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.root}>

      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Hero />
          <View style={styles.body}>
            <NextAlarmCard navigation={navigation} />
            <QuickActionsSection navigation={navigation} />
            <RecentDestinations />
          </View>
        </ScrollView>
       
        <View style={styles.floatingCTA}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.getParent()?.navigate('SetDestination')}
          >
            <LinearGradient
              colors={['#9d6fff', '#7C5CE8', '#5c40cc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.floatingCTAButton}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.floatingCTALabel}>Set Destination</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

    </View>
  );
}

// Styles 
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 2,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 50,
  },

  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.background, 
  },

  appNameMask: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 0,
  },

  hero: {
    width: '100%',
    marginTop: 0,   
  },

  heroTitle: {
    ...FONTS.heroName,
    color: COLORS.textPrimary,
    lineHeight: 32,
  },

  heroTextBlock: {
    paddingHorizontal: 24,
  },

  body: {
    paddingHorizontal: 16,
    paddingTop:        14,
    gap:               8,
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

  recentSection: {
  marginTop: 18,
},

recentHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
  paddingHorizontal: 4,
},

recentLabel: {
  ...FONTS.sectionLabel,
  color: COLORS.textSecondary,
},

seeAllText: {
  ...FONTS.cardMeta,
  color: '#9d6fff',
  fontSize: 13,
},

emptyState: {
  height: 140,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: COLORS.border,
  backgroundColor: 'rgba(255,255,255,0.03)',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
},

emptyTitle: {
  ...FONTS.cardTitle,
  color: COLORS.textPrimary,
},

emptySubtitle: {
  ...FONTS.cardMeta,
  color: COLORS.textSecondary,
  textAlign: 'center',
  paddingHorizontal: 20,
},

  floatingCTA: {
  position: 'absolute',
  bottom: 25,
  left: 16,
  right: 16,
  alignItems: 'center',
  zIndex: 20,
},

floatingCTAButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  paddingVertical: 17,
  paddingHorizontal: 106,
  marginBottom: -10,
  borderRadius: 24,
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
},

floatingCTALabel: {
  ...FONTS.cardButton,
  color: '#fff',
},
});