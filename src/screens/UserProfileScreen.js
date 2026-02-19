import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import { userService, socialService, postService } from '../services/firestore';
import PostCard from '../components/PostCard';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { colors, isDark } = useTheme();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relationship, setRelationship] = useState({
    isFollowing: false,
    isFollower: false,
    isBlocked: false,
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Load profile & relationship
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, rel, userPosts] = await Promise.all([
          userService.getProfile(userId),
          socialService.getRelationship(currentUser.uid, userId),
          postService.getByUser(userId),
        ]);
        setProfile(profileData);
        setRelationship(rel);
        setPosts(userPosts);
      } catch (e) {
        console.error('Load profile error:', e);
      }
      setLoading(false);
    };
    loadData();
  }, [userId]);

  const handleFollow = async () => {
    setActionLoading(true);
    try {
      if (relationship.isFollowing) {
        await socialService.unfollow(currentUser.uid, userId);
        setRelationship((prev) => ({ ...prev, isFollowing: false }));
        setProfile((prev) => ({
          ...prev,
          followers: (prev.followers || []).filter((id) => id !== currentUser.uid),
        }));
      } else {
        await socialService.follow(currentUser.uid, userId);
        setRelationship((prev) => ({ ...prev, isFollowing: true }));
        setProfile((prev) => ({
          ...prev,
          followers: [...(prev.followers || []), currentUser.uid],
        }));
      }
    } catch (e) {
      console.error('Follow error:', e);
    }
    setActionLoading(false);
  };

  const handleBlock = () => {
    const action = relationship.isBlocked ? 'unblock' : 'block';
    Alert.alert(
      `${action.toUpperCase()} USER`,
      `Are you sure you want to ${action} ${profile?.username || 'this user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.toUpperCase(),
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              if (relationship.isBlocked) {
                await socialService.unblock(currentUser.uid, userId);
                setRelationship((prev) => ({ ...prev, isBlocked: false }));
              } else {
                await socialService.block(currentUser.uid, userId);
                setRelationship({ isFollowing: false, isFollower: false, isBlocked: true });
              }
            } catch (e) {
              console.error('Block error:', e);
            }
            setActionLoading(false);
          },
        },
      ]
    );
  };

  const handleMessage = () => {
    navigation.navigate('ChatRoom', {
      conversationId: null,
      otherUser: {
        uid: userId,
        username: profile?.username || 'User',
        avatar: profile?.avatar || null,
      },
    });
  };

  const getFollowButtonText = () => {
    if (relationship.isBlocked) return 'BLOCKED';
    if (relationship.isFollowing) return 'FOLLOWING';
    if (relationship.isFollower) return 'FOLLOW BACK';
    return 'FOLLOW';
  };

  const getFollowButtonStyle = () => {
    if (relationship.isBlocked) return { backgroundColor: colors.danger };
    if (relationship.isFollowing) return { backgroundColor: colors.accentGreen };
    if (relationship.isFollower) return { backgroundColor: colors.accentAlt };
    return { backgroundColor: colors.accent };
  };

  const renderHeader = () => (
    <View>
      {/* Profile Card */}
      <View style={[styles.profileCard, { borderColor: colors.border }]}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.accent, borderColor: colors.border },
            ]}
          >
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {(profile?.username || 'U').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {posts.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>POSTS</Text>
            </View>
            <TouchableOpacity style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {(profile?.followers || []).length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>FOLLOWERS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {(profile?.following || []).length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>FOLLOWING</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Username & Bio */}
        <Text style={[styles.username, { color: colors.text }]}>
          {profile?.username || 'User'}
        </Text>

        {profile?.bio ? (
          <Text style={[styles.bio, { color: colors.textSecondary }]}>
            {profile.bio}
          </Text>
        ) : null}

        {/* University Tag */}
        {profile?.university && (
          <View style={[styles.uniTag, { backgroundColor: colors.accentAlt }]}>
            <Text style={styles.uniTagText}>{profile.university}</Text>
          </View>
        )}

        {/* Karma */}
        <View style={styles.karmaRow}>
          <View style={[styles.karmaBadge, { backgroundColor: colors.accentYellow, borderColor: colors.border }]}>
            <Text style={styles.karmaLabel}>KARMA</Text>
            <Text style={styles.karmaValue}>{profile?.karma || 0}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {currentUser?.uid !== userId && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleFollow}
              disabled={actionLoading || relationship.isBlocked}
              style={[
                styles.followBtn,
                { borderColor: colors.border },
                getFollowButtonStyle(),
              ]}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.followBtnText}>{getFollowButtonText()}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleMessage}
              disabled={relationship.isBlocked}
              style={[
                styles.messageBtn,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Text style={[styles.messageBtnText, { color: colors.text }]}>MESSAGE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBlock}
              style={[
                styles.blockBtn,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Text style={[styles.blockBtnText, { color: colors.danger }]}>
                {relationship.isBlocked ? '⊘' : '⊘'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Posts Header */}
      <View style={[styles.postsHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.postsHeaderText, { color: colors.text }]}>
          POSTS
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { borderColor: colors.border }]}
        >
          <Text style={[styles.backText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerName, { color: colors.text }]} numberOfLines={1}>
          {profile?.username || 'User'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={relationship.isBlocked ? [] : posts}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={currentUser?.uid}
            onPress={(post) => navigation.navigate('Comments', { post })}
            onComment={(post) => navigation.navigate('Comments', { post })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {relationship.isBlocked ? 'USER BLOCKED' : 'NO POSTS YET'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },

  // Header Bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 2.5,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { fontSize: 22, fontWeight: FONTS.black },
  headerName: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },

  // Profile Card
  profileCard: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 2.5,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 86, height: 86, borderRadius: RADIUS.full },
  avatarText: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: SPACING.md,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: FONTS.headingSize, fontWeight: FONTS.black },
  statLabel: {
    fontSize: 9,
    fontWeight: FONTS.black,
    letterSpacing: 1,
    marginTop: 2,
  },

  // Info
  username: {
    fontSize: FONTS.subheadingSize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  bio: {
    fontSize: FONTS.bodySize,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  uniTag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  uniTagText: {
    color: '#FFF',
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  karmaRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  karmaBadge: {
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  karmaLabel: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
    color: '#000',
    opacity: 0.6,
  },
  karmaValue: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
    color: '#000',
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  followBtn: {
    flex: 1,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brutalSmall,
  },
  followBtnText: {
    color: '#FFF',
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },
  messageBtn: {
    flex: 1,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBtnText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },
  blockBtn: {
    width: 44,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockBtnText: {
    fontSize: 20,
    fontWeight: FONTS.black,
  },

  // Posts
  postsHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2.5,
  },
  postsHeaderText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
  },
  listContent: { paddingBottom: 100 },
  empty: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
    letterSpacing: -1,
  },
});

export default UserProfileScreen;
