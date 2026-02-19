import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import { formatKarma } from '../utils/helpers';

const ProfileHeader = ({ user }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      {/* Big avatar */}
      <View
        style={[
          styles.avatar,
          { backgroundColor: colors.accent, borderColor: colors.border },
        ]}
      >
        <Text style={styles.avatarText}>
          {user?.username?.charAt(0) || 'A'}
        </Text>
      </View>

      {/* Username - BRUTALIST BIG */}
      <Text style={[styles.username, { color: colors.text }]}>
        {user?.username || 'Anonymous'}
      </Text>

      {/* University tag */}
      <View style={[styles.uniTag, { backgroundColor: colors.accentAlt }]}>
        <Text style={styles.uniTagText}>
          {user?.university || 'University'}
        </Text>
      </View>

      {/* Karma */}
      <View style={styles.karmaRow}>
        <View
          style={[
            styles.karmaBox,
            { backgroundColor: colors.accentYellow, borderColor: colors.border },
          ]}
        >
          <Text style={styles.karmaLabel}>karma</Text>
          <Text style={[styles.karmaValue, { color: colors.black }]}>
            {formatKarma(user?.karma)}
          </Text>
        </View>
        <View
          style={[
            styles.karmaBox,
            { backgroundColor: colors.accentGreen, borderColor: colors.border },
          ]}
        >
          <Text style={styles.karmaLabel}>communities</Text>
          <Text style={[styles.karmaValue, { color: colors.black }]}>
            {user?.joinedCommunities?.length || 0}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.sm,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '900',
  },
  username: {
    fontSize: FONTS.titleSize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  uniTag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  uniTagText: {
    color: '#FFF',
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  karmaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  karmaBox: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  karmaLabel: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#000',
    opacity: 0.6,
  },
  karmaValue: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
  },
});

export default memo(ProfileHeader);
