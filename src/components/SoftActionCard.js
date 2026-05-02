import { Ionicons }                from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect } from 'react-native-svg';


// ─── Animated wrappers ────────────────────────────────────────────────────────

const AnimatedView = Animated.View;


// ─── Download Maps — isometric tiles + floating pin ──────────────────────────

function DownloadMapsGraphic() {
  const pinFloat  = useRef(new Animated.Value(0)).current;
  const arrowBob  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pinFloat, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pinFloat, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowBob, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(arrowBob, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const pinY   = pinFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const arrowY = arrowBob.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  return (
    <View style={g.wrap}>
      {/* Static iso tiles */}
      <Svg width="100%" height="110" viewBox="0 0 155 110" style={g.abs}>
        {/* Tile 1 — back left, cyan */}
        <Polygon points="18,62 48,47 78,62 48,77"  fill="#00D4FF" fillOpacity="0.18" stroke="#00D4FF" strokeWidth="0.8" strokeOpacity="0.5"/>
        <Polygon points="18,62 18,76 48,91 48,77"  fill="#00D4FF" fillOpacity="0.08" stroke="#00D4FF" strokeWidth="0.8" strokeOpacity="0.35"/>
        <Polygon points="78,62 78,76 48,91 48,77"  fill="#00D4FF" fillOpacity="0.12" stroke="#00D4FF" strokeWidth="0.8" strokeOpacity="0.4"/>

        {/* Tile 2 — raised center, amber */}
        <Polygon points="48,35 78,20 108,35 78,50"  fill="#FFD166" fillOpacity="0.88" stroke="#FFD166" strokeWidth="0.8" strokeOpacity="0.7"/>
        <Polygon points="48,35 48,62 78,77 78,50"   fill="#FFD166" fillOpacity="0.32" stroke="#FFD166" strokeWidth="0.8" strokeOpacity="0.5"/>
        <Polygon points="108,35 108,62 78,77 78,50"  fill="#FFD166" fillOpacity="0.48" stroke="#FFD166" strokeWidth="0.8" strokeOpacity="0.55"/>
      </Svg>

      {/* Animated download arrow — right side */}
      <AnimatedView style={[g.abs, { left: 0, top: 0, right: 0, bottom: 0, transform: [{ translateY: arrowY }] }]}>
        <Svg width="100%" height="110" viewBox="0 0 155 110">
          <Line x1="128" y1="18" x2="128" y2="62" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85"/>
          <Path d="M119,54 L128,66 L137,54" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.85"/>
          <Line x1="119" y1="74" x2="137" y2="74" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85"/>
        </Svg>
      </AnimatedView>
    </View>
  );
}


// ─── My Places — constellation pins (shifted up) ──────────────────────────────

function MyPlacesGraphic() {
  const p1 = useRef(new Animated.Value(0)).current;
  const p2 = useRef(new Animated.Value(0)).current;
  const p3 = useRef(new Animated.Value(0)).current;
  const p4 = useRef(new Animated.Value(0)).current;

  function floatPin(anim, delay, dur) {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }

  useEffect(() => {
    floatPin(p1, 0,   1100);
    floatPin(p2, 280, 1300);
    floatPin(p3, 560, 1000);
    floatPin(p4, 840, 1200);
  }, []);

  const t1 = p1.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const t2 = p2.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const t3 = p3.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const t4 = p4.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });

  return (
    // marginTop: -14 lifts the whole graphic upward inside the card
    <View style={[g.wrap, { marginTop: -14, transform: [{ translateX: 12 }] }]}>

      {/* Static: constellation lines + shadows */}
      <Svg width="100%" height="110" viewBox="0 0 155 110" style={g.abs}>
        <Line x1="22"  y1="82" x2="62"  y2="48" stroke="#FFD166" strokeWidth="0.8" strokeOpacity="0.3"/>
        <Line x1="62"  y1="48" x2="102" y2="68" stroke="#FFD166" strokeWidth="0.8" strokeOpacity="0.3"/>
        <Line x1="62"  y1="48" x2="82"  y2="22" stroke="#FFD166" strokeWidth="0.8" strokeOpacity="0.3"/>
        <Line x1="102" y1="68" x2="138" y2="44" stroke="#FFD166" strokeWidth="0.8" strokeOpacity="0.2"/>
        {/* Shadows */}
        <Ellipse cx="22"  cy="96" rx="10" ry="2.5" fill="#000" fillOpacity="0.15"/>
        <Ellipse cx="62"  cy="96" rx="10" ry="2.5" fill="#000" fillOpacity="0.15"/>
        <Ellipse cx="102" cy="96" rx="9"  ry="2.2" fill="#000" fillOpacity="0.12"/>
      </Svg>

      {/* Pin 1 — large amber, bottom-left */}
      <AnimatedView style={[g.abs, { left: 4, top: 30, transform: [{ translateY: t1 }] }]}>
        <Svg width="38" height="56" viewBox="0 0 40 56">
          <Path d="M20 2 C9 2 2 11 2 20 C2 34 20 52 20 52 C20 52 38 34 38 20 C38 11 31 2 20 2 Z" fill="#ff6c17" fillOpacity="0.95"/>
          <Circle cx="20" cy="20" r="8" fill="#7C5CE8"/>
          <Polygon points="20,14 21.8,18.5 26.5,18.5 22.8,21.5 24.2,26 20,23 15.8,26 17.2,21.5 13.5,18.5 18.2,18.5" fill="#fffb00" fillOpacity="0.95"/>
        </Svg>
      </AnimatedView>

      {/* Pin 2 — cyan, center */}
      <AnimatedView style={[g.abs, { left: 44, top: 0, transform: [{ translateY: t2 }] }]}>
        <Svg width="32" height="48" viewBox="0 0 40 56">
          <Path d="M20 2 C9 2 2 11 2 20 C2 34 20 52 20 52 C20 52 38 34 38 20 C38 11 31 2 20 2 Z" fill="#00D4FF" fillOpacity="0.9"/>
          <Circle cx="20" cy="20" r="7" fill="#7C5CE8"/>
          <Circle cx="20" cy="20" r="3" fill="#00D4FF"/>
        </Svg>
      </AnimatedView>

      {/* Pin 3 — pink, right-center */}
      <AnimatedView style={[g.abs, { left: 84, top: 18, transform: [{ translateY: t3 }] }]}>
        <Svg width="28" height="42" viewBox="0 0 40 56">
          <Path d="M20 2 C9 2 2 11 2 20 C2 34 20 52 20 52 C20 52 38 34 38 20 C38 11 31 2 20 2 Z" fill="#ff3131" fillOpacity="0.82"/>
          <Circle cx="20" cy="20" r="6.5" fill="#7C5CE8"/>
        </Svg>
      </AnimatedView>

    </View>
  );
}


// ─── Shared graphic styles ────────────────────────────────────────────────────

const g = StyleSheet.create({
  wrap: { width: '100%', height: 90 },
  abs:  { position: 'absolute' },
});


// ─── Card config ──────────────────────────────────────────────────────────────

const CARD_CONFIG = {
  'download-outline': { Graphic: DownloadMapsGraphic },
  'location-outline': { Graphic: MyPlacesGraphic },
};


// ─── Card ─────────────────────────────────────────────────────────────────────

export default function SoftActionCard({ icon, title, subtitle, onPress }) {
  const config  = CARD_CONFIG[icon] ?? { Graphic: null };
  const Graphic = config.Graphic;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" style={styles.arrow}/>
      </View>

      {Graphic && (
        <View style={styles.graphicWrapper}>
          <Graphic />
        </View>
      )}
    </TouchableOpacity>
  );
}


// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flex:            1,
    height:          170,
    borderRadius:    22,
    padding:         16,
    overflow:        'hidden',
    backgroundColor: '#7C5CE8',
  },
  topRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
  },
  textBlock: {
    flex:         1,
    paddingRight: 16,
  },
  title: {
    fontSize:   16,
    fontWeight: '600',
    color:      '#fff',
  },
  subtitle: {
    fontSize:  12,
    color:     'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  arrow: {
    marginLeft: 8,
  },
  graphicWrapper: {
    flex:           1,
    justifyContent: 'flex-end',
  },
});