import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import { formatTimestamp } from '../utils/helpers';

const CommentItem = ({ comment, depth = 0, onReply, currentUserId }) => {
  const { colors } = useTheme();
  const maxDepth = 3;
  const indent = Math.min(depth, maxDepth) * 16;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);

  const depthColors = [colors.accent, colors.accentPurple, colors.accentPink, colors.accentGreen];
  const threadColor = depthColors[(depth - 1) % depthColors.length] || colors.accent;

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <View
      style={[
        styles.container,
        {
          marginLeft: indent,
          borderLeftColor: depth > 0 ? threadColor : 'transparent',
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
            {comment.university ? (
              <View style={[styles.uniTag, { backgroundColor: colors.accent }]}>
                <Text style={styles.uniTagText}>{comment.university}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.timestamp, { color: colors.textMuted }]}>
            {formatTimestamp(comment.createdAt)}
          </Text>
        </View>
        <Text style={[styles.text, { color: colors.text }]}>
          {comment.text}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleLike} style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons
              name={liked ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
              size={16}
              color={liked ? colors.upvote : colors.textMuted}
            />
            <Text style={[styles.actionText, { color: liked ? colors.upvote : colors.textMuted }]}>
              {likeCount > 0 ? likeCount : 'UPVOTE'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onReply?.(comment)}
            style={styles.actionBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="return-down-forward-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.actionText, { color: colors.textMuted }]}>
              REPLY
            </Text>
          </TouchableOpacity>
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
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  actionText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 0.5,
  },
});

export default memo(CommentItem);
