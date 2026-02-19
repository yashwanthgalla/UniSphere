import React, { memo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS, POST_TYPES } from '../theme';
import { formatTimestamp } from '../utils/helpers';
import { postService } from '../services/firestore';

const { width } = Dimensions.get('window');

// ─── Poll Option Component ────────────────────────
const PollOption = ({ option, totalVotes, hasVoted, votedOption, onVote, colors, index }) => {
  const votes = option.votes || 0;
  const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

  return (
    <TouchableOpacity
      activeOpacity={hasVoted ? 1 : 0.7}
      onPress={() => !hasVoted && onVote?.(index)}
      style={[
        styles.pollOption,
        {
          borderColor: votedOption === index ? colors.accentPurple : colors.border,
          backgroundColor: colors.inputBg,
        },
      ]}
    >
      {hasVoted && (
        <View
          style={[
            styles.pollBar,
            {
              width: `${pct}%`,
              backgroundColor: votedOption === index
                ? colors.accentPurple + '30'
                : colors.textMuted + '15',
            },
          ]}
        />
      )}
      <View style={styles.pollOptionContent}>
        <Text style={[styles.pollOptionText, { color: colors.text }]} numberOfLines={1}>
          {option.text}
        </Text>
        {hasVoted && (
          <Text style={[styles.pollPct, { color: votedOption === index ? colors.accentPurple : colors.textMuted }]}>
            {pct}%
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Main PostCard ────────────────────────────────
const PostCard = ({ post, onPress, onLike, onComment, onUserPress, currentUserId }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const initialVote = post.upvotedBy?.includes(currentUserId)
    ? 'up'
    : post.downvotedBy?.includes(currentUserId)
    ? 'down'
    : post.likedBy?.includes(currentUserId)
    ? 'up'
    : null;

  const [voteState, setVoteState] = useState(initialVote);
  const [voteScore, setVoteScore] = useState(
    (post.upvotes || post.likes || 0) - (post.downvotes || 0)
  );
  const [bookmarked, setBookmarked] = useState(
    post.bookmarkedBy?.includes(currentUserId) || false
  );

  const postType = post.postType || (post.image ? 'image' : 'text');
  const typeConfig = POST_TYPES[postType] || POST_TYPES.text;
  const isConfession = postType === 'confession';
  const isPoll = postType === 'poll';

  const [pollVotedOption, setPollVotedOption] = useState(
    post.pollVotedBy?.[currentUserId] ?? null
  );
  const hasPollVoted = pollVotedOption !== null;
  const pollTotalVotes = (post.pollOptions || []).reduce((sum, o) => sum + (o.votes || 0), 0);

  const handleUpvote = async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.15, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    if (voteState === 'up') {
      setVoteState(null);
      setVoteScore((s) => s - 1);
      try { await postService.removeUpvote(post.id, currentUserId); } catch (e) {}
    } else {
      const wasDown = voteState === 'down';
      setVoteState('up');
      setVoteScore((s) => s + (wasDown ? 2 : 1));
      try { await postService.upvote(post.id, currentUserId, wasDown); } catch (e) {}
    }
  };

  const handleDownvote = async () => {
    if (voteState === 'down') {
      setVoteState(null);
      setVoteScore((s) => s + 1);
      try { await postService.removeDownvote(post.id, currentUserId); } catch (e) {}
    } else {
      const wasUp = voteState === 'up';
      setVoteState('down');
      setVoteScore((s) => s - (wasUp ? 2 : 1));
      try { await postService.downvote(post.id, currentUserId, wasUp); } catch (e) {}
    }
  };

  const handleBookmark = async () => {
    setBookmarked(!bookmarked);
    try {
      if (bookmarked) {
        await postService.unbookmark(post.id, currentUserId);
      } else {
        await postService.bookmark(post.id, currentUserId);
      }
    } catch (e) {}
  };

  const handlePollVote = (optionIndex) => {
    setPollVotedOption(optionIndex);
    postService.votePoll?.(post.id, currentUserId, optionIndex).catch(() => {});
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress?.(post)}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isConfession ? colors.accentPink : colors.border,
        },
      ]}
    >
      {/* Post type badge */}
      <View style={[styles.typeBadge, { backgroundColor: typeConfig.color }]}>
        <Ionicons name={typeConfig.icon} size={10} color="#FFF" />
        <Text style={styles.typeBadgeText}>{typeConfig.label}</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => !isConfession && onUserPress?.(post.userId)}
          activeOpacity={isConfession ? 1 : 0.7}
          style={[
            styles.avatar,
            {
              backgroundColor: isConfession ? colors.accentPink : colors.accent,
              borderColor: colors.border,
            },
          ]}
        >
          {isConfession ? (
            <Ionicons name="eye-off" size={18} color="#FFF" />
          ) : (
            <Text style={styles.avatarText}>
              {post.username?.charAt(0) || 'A'}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <TouchableOpacity
            onPress={() => !isConfession && onUserPress?.(post.userId)}
            disabled={isConfession}
          >
            <Text
              style={[styles.username, { color: isConfession ? colors.accentPink : colors.text }]}
              numberOfLines={1}
            >
              {isConfession ? 'Anonymous' : post.username}
            </Text>
          </TouchableOpacity>
          <View style={styles.metaRow}>
            {!isConfession && post.university ? (
              <View style={[styles.uniTag, { backgroundColor: colors.accentAlt }]}>
                <Text style={styles.uniTagText}>{post.university}</Text>
              </View>
            ) : null}
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

      {/* Poll */}
      {isPoll && post.pollOptions && (
        <View style={styles.pollContainer}>
          {post.pollOptions.map((option, idx) => (
            <PollOption
              key={idx}
              option={option}
              index={idx}
              totalVotes={pollTotalVotes}
              hasVoted={hasPollVoted}
              votedOption={pollVotedOption}
              onVote={handlePollVote}
              colors={colors}
            />
          ))}
          <Text style={[styles.pollMeta, { color: colors.textMuted }]}>
            {pollTotalVotes} votes
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        <View style={[styles.voteGroup, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <TouchableOpacity onPress={handleUpvote} style={styles.voteBtn}>
            <Animated.View style={{ transform: [{ scale: voteState === 'up' ? scaleAnim : 1 }] }}>
              <Ionicons
                name={voteState === 'up' ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
                size={22}
                color={voteState === 'up' ? colors.upvote : colors.textMuted}
              />
            </Animated.View>
          </TouchableOpacity>
          <Text
            style={[
              styles.voteScore,
              {
                color:
                  voteState === 'up'
                    ? colors.upvote
                    : voteState === 'down'
                    ? colors.downvote
                    : colors.text,
              },
            ]}
          >
            {voteScore}
          </Text>
          <TouchableOpacity onPress={handleDownvote} style={styles.voteBtn}>
            <Ionicons
              name={voteState === 'down' ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
              size={22}
              color={voteState === 'down' ? colors.downvote : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onComment?.(post)}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
          <Text style={[styles.actionCount, { color: colors.text }]}>
            {post.commentCount || post.commentsCount || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={18} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleBookmark}>
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={bookmarked ? colors.accentYellow : colors.text}
          />
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
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomRightRadius: RADIUS.sm,
    gap: 4,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
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
    borderRadius: 20,
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
  pollContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  pollOption: {
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    position: 'relative',
  },
  pollBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: RADIUS.sm - 2,
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  pollOptionText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.bold,
    flex: 1,
  },
  pollPct: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    marginLeft: SPACING.sm,
  },
  pollMeta: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 2,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  voteGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  voteBtn: {
    padding: 4,
  },
  voteScore: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    minWidth: 24,
    textAlign: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  actionCount: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.bold,
  },
});

export default memo(PostCard);
