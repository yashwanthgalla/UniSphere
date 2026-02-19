import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../theme';

const ProfileHeader = ({ user, profile, onEditProfile, onFollowers, onFollowing, isOwnProfile = true }) => {
  const { colors } = useTheme();

  const followerCount = (profile?.followers || []).length;
  const followingCount = (profile?.following || []).length;
  const postCount = profile?.postCount || 0;
  const karma = (profile?.karma || 0);
  const displayAvatar = profile?.avatar || user?.photoURL;
  const displayName = profile?.username || user?.displayName || 'Anonymous';
  const bio = profile?.bio || '';
  const university = profile?.university || user?.university || '';

  const formatCount = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 10000) return (num / 1000).toFixed(0) + 'K';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  };

  return (
    <View style={[styles.container]}>
      {/* Top Row: Avatar + Stats */}
      <View style={styles.topRow}>
        {/* Avatar */}
        <TouchableOpacity
          onPress={isOwnProfile ? onEditProfile : undefined}
          activeOpacity={isOwnProfile ? 0.7 : 1}
        >
          <View style={styles.avatarRing}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.accent },
              ]}
            >
              {displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {formatCount(postCount)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
          </View>
          <TouchableOpacity style={styles.statItem} onPress={onFollowers} activeOpacity={0.7}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {formatCount(followerCount)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={onFollowing} activeOpacity={0.7}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {formatCount(followingCount)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Name & Bio */}
      <View style={styles.infoSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.displayName, { color: colors.text }]}>
            {displayName}
          </Text>
          {karma > 0 && (
            <View style={[styles.karmaBadge, { backgroundColor: colors.accentYellow, borderColor: colors.border }]}>
              <Ionicons name="flash" size={11} color="#000" />
              <Text style={styles.karmaText}>{formatCount(karma)}</Text>
            </View>
          )}
        </View>

        {university ? (
          <View style={styles.universityRow}>
            <Ionicons name="school-outline" size={13} color={colors.accentAlt} />
            <Text style={[styles.universityText, { color: colors.accentAlt }]}>
              {university}
            </Text>
          </View>
        ) : null}

        {bio ? (
          <Text style={[styles.bio, { color: colors.text }]}>
            {bio}
          </Text>
        ) : null}
      </View>

      {/* Action Buttons */}
      {isOwnProfile && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={onEditProfile}
            style={[styles.actionBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Share profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtnSmall, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add-outline" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '800',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONTS.subheadingSize,
    fontWeight: FONTS.black,
  },
  statLabel: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.regular,
    marginTop: 2,
  },

  // Info
  infoSection: {
    marginBottom: SPACING.sm,
  },
  displayName: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.bold,
    marginBottom: 2,
  },
  universityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  universityText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.semiBold,
  },
  bio: {
    fontSize: FONTS.bodySize,
    lineHeight: 20,
    marginTop: 4,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 7,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: FONTS.bodySize - 1,
    fontWeight: FONTS.semiBold,
  },
  actionBtnSmall: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  karmaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  karmaText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    color: '#000',
    letterSpacing: 0.5,
  },
});

export default memo(ProfileHeader);
