import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS, BRUTAL } from '../theme';
import { formatTimestamp } from '../utils/helpers';

const { width } = Dimensions.get('window');

const PostCard = ({ post, onPress, onLike, onComment, currentUserId }) => {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(
    post.likedBy?.includes(currentUserId) || false
  );
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    onLike?.(post.id, !liked);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress?.(post)}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.accent, borderColor: colors.border },
          ]}
        >
          <Text style={styles.avatarText}>
            {post.username?.charAt(0) || 'A'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text
            style={[styles.username, { color: colors.text }]}
            numberOfLines={1}
          >
            {post.username}
          </Text>
          <View style={styles.metaRow}>
            <View
              style={[styles.uniTag, { backgroundColor: colors.accentAlt }]}
            >
              <Text style={styles.uniTagText}>{post.university}</Text>
            </View>
            {post.communityName && (
              <Text style={[styles.communityLabel, { color: colors.textMuted }]}>
                in{' '}
                <Text style={{ fontWeight: FONTS.bold, color: colors.accent }}>
                  {post.communityName}
                </Text>
              </Text>
            )}
          </View>
        </View>
        <Text style={[styles.timestamp, { color: colors.textMuted }]}>
          {formatTimestamp(post.createdAt)}
        </Text>
      </View>

      {/* Content */}
      <Text style={[styles.content, { color: colors.text }]}>{post.text}</Text>

      {/* Image */}
      {post.image && (
        <View style={[styles.imageContainer, { borderColor: colors.border }]}>
          <Image source={{ uri: post.image }} style={styles.image} />
        </View>
      )}

      {/* Actions */}
      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            liked && { backgroundColor: colors.accent },
          ]}
          onPress={handleLike}
        >
          <Text
            style={[
              styles.actionIcon,
              { color: liked ? '#FFF' : colors.text },
            ]}
          >
            ▲
          </Text>
          <Text
            style={[
              styles.actionCount,
              { color: liked ? '#FFF' : colors.text },
            ]}
          >
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onComment?.(post)}
        >
          <Text style={[styles.actionIcon, { color: colors.text }]}>💬</Text>
          <Text style={[styles.actionCount, { color: colors.text }]}>
            {post.commentCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={[styles.actionIcon, { color: colors.text }]}>↗</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
  },
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  username: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  uniTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  uniTagText: {
    color: '#FFF',
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  communityLabel: {
    fontSize: FONTS.tinySize,
    letterSpacing: 0.3,
  },
  timestamp: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    fontSize: FONTS.bodySize,
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    fontWeight: FONTS.regular,
  },
  imageContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 2,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  actionIcon: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
  },
  actionCount: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.bold,
  },
});

export default memo(PostCard);
