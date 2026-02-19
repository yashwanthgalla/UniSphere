import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import { formatTimestamp } from '../utils/helpers';

const CommentItem = ({ comment, depth = 0 }) => {
  const { colors } = useTheme();
  const maxDepth = 3;
  const indent = Math.min(depth, maxDepth) * 16;

  return (
    <View
      style={[
        styles.container,
        {
          marginLeft: indent,
          borderLeftColor: depth > 0 ? colors.accent : 'transparent',
          borderLeftWidth: depth > 0 ? 3 : 0,
        },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.accentAlt, borderColor: colors.border },
            ]}
          >
            <Text style={styles.avatarText}>
              {comment.username?.charAt(0) || 'A'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.username, { color: colors.text }]}>
              {comment.username}
            </Text>
            <View style={[styles.uniTag, { backgroundColor: colors.accent }]}>
              <Text style={styles.uniTagText}>{comment.university}</Text>
            </View>
          </View>
          <Text style={[styles.timestamp, { color: colors.textMuted }]}>
            {formatTimestamp(comment.createdAt)}
          </Text>
        </View>
        <Text style={[styles.text, { color: colors.text }]}>
          {comment.text}
        </Text>
        <View style={styles.actions}>
          <Text style={[styles.actionText, { color: colors.textMuted }]}>
            ▲ UPVOTE
          </Text>
          <Text style={[styles.actionText, { color: colors.textMuted }]}>
            ↩ REPLY
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.xs,
  },
  card: {
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  username: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },
  uniTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  uniTagText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.medium,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: FONTS.captionSize,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 0.5,
  },
});

export default memo(CommentItem);
