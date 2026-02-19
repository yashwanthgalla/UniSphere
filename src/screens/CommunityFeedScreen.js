import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import PostCard from '../components/PostCard';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { communityService } from '../services/firestore';

const CommunityFeedScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { community: initialCommunity } = route.params;
  const [community, setCommunity] = useState(initialCommunity);
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const isMember = community.members?.includes(user?.uid);

  // Real-time listener for the community document (live member count etc.)
  useEffect(() => {
    const unsubscribe = communityService.listenOne(initialCommunity.id, (updated) => {
      setCommunity(updated);
    });
    return () => unsubscribe();
  }, [initialCommunity.id]);

  // Real-time listener for posts in this community
  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('communityId', '==', initialCommunity.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [initialCommunity.id]);

  const handlePostPress = (post) => {
    navigation.navigate('Comments', { post });
  };

  const handleUserPress = (postUser) => {
    if (postUser?.userId && postUser.userId !== user?.uid) {
      navigation.navigate('UserProfile', { userId: postUser.userId });
    }
  };

  const handleJoinLeave = async () => {
    if (!user?.uid) return;
    try {
      if (isMember) {
        await communityService.leave(community.id, user.uid);
      } else {
        await communityService.join(community.id, user.uid);
      }
    } catch (e) {
      console.error('Join/Leave error:', e);
    }
  };

  const renderItem = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        currentUserId={user?.uid}
        onPress={handlePostPress}
        onComment={handlePostPress}
        onUserPress={() => handleUserPress({ userId: item.userId })}
      />
    ),
    [user]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.communityIcon}>{community.icon || '🌐'}</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {community.name?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.memberRow}>
              <Ionicons name="people" size={12} color={colors.textMuted} />
              <Text style={[styles.memberCount, { color: colors.textMuted }]}>
                {community.memberCount?.toLocaleString() || 0} members
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleJoinLeave}
            style={[
              styles.joinBtn,
              {
                backgroundColor: isMember ? colors.card : colors.accent,
                borderColor: isMember ? colors.border : colors.accent,
              },
            ]}
          >
            <Ionicons
              name={isMember ? 'exit-outline' : 'enter-outline'}
              size={14}
              color={isMember ? colors.text : '#FFF'}
            />
            <Text style={[styles.joinBtnText, { color: isMember ? colors.text : '#FFF' }]}>
              {isMember ? 'LEAVE' : 'JOIN'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Description banner */}
      {community.description ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: community.color || colors.accent,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={styles.bannerText}>{community.description}</Text>
        </View>
      ) : null}

      {/* Posts */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="newspaper-outline" size={48} color={colors.textMuted} style={{ marginBottom: SPACING.md, opacity: 0.3 }} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            NO POSTS YET
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            be the first to post here
          </Text>
          {isMember && (
            <TouchableOpacity
              onPress={() => navigation.navigate('CreatePost', { communityId: community.id, communityName: community.name })}
              style={[styles.createPostBtn, { backgroundColor: colors.accent, borderColor: colors.border }]}
            >
              <Ionicons name="add" size={16} color="#FFF" />
              <Text style={styles.createPostBtnText}>CREATE POST</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Create Post Button */}
      {isMember && posts.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatePost', { communityId: community.id, communityName: community.name })}
          style={[styles.fab, { backgroundColor: colors.accent, borderColor: colors.border }]}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    borderBottomWidth: 2.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  headerInfo: {},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  communityIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: FONTS.titleSize,
    fontWeight: FONTS.black,
    letterSpacing: -1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  memberCount: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 4,
  },
  joinBtnText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },
  banner: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2.5,
  },
  bannerText: {
    color: '#FFF',
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.bold,
  },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: 100,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
    letterSpacing: -1,
  },
  emptyText: {
    fontSize: FONTS.captionSize,
    marginTop: SPACING.xs,
    textTransform: 'lowercase',
    letterSpacing: 1,
  },
  createPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    gap: 6,
  },
  createPostBtnText: {
    color: '#FFF',
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
});

export default CommunityFeedScreen;
