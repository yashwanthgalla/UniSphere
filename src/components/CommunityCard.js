import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';

const CommunityCard = ({ community, onPress, onJoin, isJoined }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(community)}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        {/* Icon */}
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: community.color || colors.accent,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={styles.icon}>{community.icon || '🌐'}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
          >
            {community.name}
          </Text>
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {community.description}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.members, { color: colors.textMuted }]}>
              {community.memberCount?.toLocaleString() || 0} members
            </Text>
          </View>
        </View>

        {/* Join Button */}
        <TouchableOpacity
          onPress={() => onJoin?.(community)}
          style={[
            styles.joinBtn,
            {
              backgroundColor: isJoined ? colors.card : colors.accent,
              borderColor: isJoined ? colors.border : colors.accent,
            },
          ]}
        >
          <Ionicons
            name={isJoined ? 'checkmark' : 'add'}
            size={14}
            color={isJoined ? colors.text : '#FFF'}
          />
          <Text
            style={[
              styles.joinText,
              { color: isJoined ? colors.text : '#FFF' },
            ]}
          >
            {isJoined ? 'JOINED' : 'JOIN'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2.5,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  name: {
    fontSize: FONTS.subheadingSize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: FONTS.captionSize,
    marginTop: 2,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  members: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.sm,
    marginLeft: SPACING.sm,
    gap: 4,
  },
  joinText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },
});

export default memo(CommunityCard);
