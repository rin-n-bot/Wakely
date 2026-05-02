import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import GlassCard from '../../components/GlassCard';
import { COLORS, FONTS } from '../../constants/theme';

// ScreenHeader 
export function ScreenHeader({ onBack, topInset }) {
  return (
    <View style={[styles.header, { paddingTop: topInset + 10 }]}>
      <TouchableOpacity hitSlop={12} activeOpacity={0.7} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Set Destination</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

// SearchBar 
export function SearchBar({ value, onChange, onSubmit, isSearching }) {
  return (
    <View style={styles.searchWrapper}>
      <View style={styles.searchBar}>
        
        {isSearching ? (
          <ActivityIndicator size="small" color={COLORS.textSecondary} />
        ) : (
          <Ionicons
            name="search-outline"
            size={18}
            color={COLORS.textSecondary}
          />
        )}

        <TextInput
          style={styles.searchInput}
          placeholder="Search city, street, or place..."
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
        />
      </View>
    </View>
  );
}

// SelectionCard 
export function SelectionCard({
  destination,
  destinationName,
  userCoords,
  userLocationName,
  isPinMode,
  distanceLabel,
  isRouting,
  onSelectDestination,
  onClearDestination,
  onContinue,
}) {
  const destLabel = destination
    ? `${destination[1].toFixed(5)},  ${destination[0].toFixed(5)}`
    : 'Tap to place a pin';

  const locationLabel = userCoords
    ? `${userCoords[1].toFixed(5)},  ${userCoords[0].toFixed(5)}`
    : 'Locating...';

  const destinationCityLabel = destination
    ? (destinationName ?? 'Finding city...')
    : 'Choose a destination';

  const userCityLabel = userCoords
    ? (userLocationName ?? 'Finding city...')
    : 'Waiting for GPS';

  return (
    <GlassCard style={styles.selectionCard}>
      {/* Destination row */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.selectionRow, isPinMode && styles.selectionRowActive]}
        onPress={!destination ? onSelectDestination : undefined}
      >
        <View style={styles.selectionIconBox}>
          <Ionicons name="location" size={22} color={COLORS.accent} />
        </View>

        <View style={styles.selectionText}>
          <Text style={styles.selectionLabel}>Destination</Text>
          <Text
            style={[styles.selectionValue, !destination && styles.selectionPlaceholder]}
            numberOfLines={1}
          >
            {destLabel}
          </Text>
          <Text style={styles.selectionCity} numberOfLines={2}>
            {destinationCityLabel}
          </Text>
        </View>

        {isPinMode && !destination ? (
          <View style={styles.pinModeBadge}>
            <Text style={styles.pinModeBadgeText}>Placing...</Text>
          </View>
        ) : null}

        {destination && !isPinMode ? (
          <View style={styles.destinationMeta}>
            {isRouting ? <ActivityIndicator size="small" color={COLORS.accent} /> : null}

            {distanceLabel ? (
              <View style={styles.distancePill}>
                <Ionicons name="navigate-outline" size={11} color={COLORS.accent} />
                <Text style={styles.distancePillText}>{distanceLabel}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              hitSlop={10}
              activeOpacity={0.7}
              onPress={onClearDestination}
              style={styles.redoButton}
            >
              <Ionicons name="close" size={15} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : null}
      </TouchableOpacity>

      <View style={styles.selectionDivider} />

      {/* User location row */}
      <View style={styles.selectionRow}>
        <View style={styles.selectionIconBox}>
          <Ionicons name="navigate" size={22} color={COLORS.textSecondary} />
        </View>

        <View style={styles.selectionText}>
          <Text style={styles.selectionLabel}>Your Location</Text>
          <Text style={styles.selectionValue} numberOfLines={1}>
            {locationLabel}
          </Text>
          <Text style={styles.selectionCity} numberOfLines={2}>
            {userCityLabel}
          </Text>
        </View>
      </View>

      {destination && !isPinMode ? (
        <TouchableOpacity activeOpacity={0.82} style={styles.continueTouchable} onPress={onContinue}>
          <LinearGradient
            colors={['#9d6fff', '#7C5CE8', '#5c40cc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueLabel}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : null}
    </GlassCard>
  );
}

// Styles 
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  headerTitle: {
    ...FONTS.cardTitle,
    color: COLORS.textPrimary,
    fontSize: 18,
  },

searchWrapper: {
  paddingHorizontal: 16,
  marginTop: 14,
},

searchBar: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,

  backgroundColor: 'rgba(255,255,255,0.06)', // soft grey transparency
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',

  paddingHorizontal: 12,
  paddingVertical: 10,

  borderRadius: 12,
},

searchInput: {
  flex: 1,
  fontSize: 14,
  letterSpacing: -0.5,
  color: COLORS.textPrimary,
  paddingVertical: 0,
  includeFontPadding: false,
},

  selectionCard: {
    gap: 0,
    paddingVertical: 14,
  },

  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 4,
  },

  selectionRowActive: {
    backgroundColor: 'rgba(124,92,232,0.10)',
    marginLeft: -8,
    marginRight: -8,
    paddingHorizontal: 12,
  },

  selectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectionText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },

  selectionLabel: {
    ...FONTS.sectionLabel,
    color: COLORS.textSecondary,
  },

  selectionValue: {
    ...FONTS.cardTitle,
    color: COLORS.textPrimary,
    fontSize: 13,
  },

  selectionPlaceholder: {
    color: COLORS.textSecondary,
  },

  selectionCity: {
    ...FONTS.cardTitle,
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 20,
  },

  selectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
    marginLeft: 48,
  },

  pinModeBadge: {
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(124,92,232,0.4)',
    paddingHorizontal: 8,
    marginRight: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  pinModeBadgeText: {
    ...FONTS.cardMeta,
    color: COLORS.accent,
  },

  destinationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 4,
    flexShrink: 0,
  },

  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(124,92,232,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  distancePillText: {
    ...FONTS.cardMeta,
    color: COLORS.textPrimary,
    fontSize: 11,
  },

  redoButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueTouchable: {
    marginTop: 14,
  },

  continueGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 24,
  },

  continueLabel: {
    ...FONTS.cardButton,
    color: '#fff',
    fontSize: 15,
  },
});