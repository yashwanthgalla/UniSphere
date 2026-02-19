import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import PostCard from '../components/PostCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/firestore';

const FEED_TABS = [
  { key: 'foryou', label: 'For You', icon: 'sparkles' },
  { key: 'following', label: 'Following', icon: 'people' },
  { key: 'trending', label: 'Trending', icon: 'trending-up' },
];

const HomeFeedScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('foryou');
  const [followingIds, setFollowingIds] = useState([]);
  const { user } = useAuth();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handlePostPress = (post) => {
    navigation.navigate('Comments', { post });
  };

  const handleUserPress = (userId) => {
    if (userId && userId !== user?.uid) {
      navigation.navigate('UserProfile', { userId });
    }
  };

  // Get feed data based on active tab
  const getFeedData = useCallback(() => {
    let filteredPosts = [...posts];

    if (activeTab === 'following') {
      filteredPosts = filteredPosts.filter(
        (p) => followingIds.includes(p.userId) || p.userId === user?.uid
      );
    } else if (activeTab === 'trending') {
      filteredPosts.sort((a, b) => {
        const scoreA = (a.upvotes || a.likes || 0) + (a.commentCount || a.commentsCount || 0) * 2;
        const scoreB = (b.upvotes || b.likes || 0) + (b.commentCount || b.commentsCount || 0) * 2;
        return scoreB - scoreA;
      });
    }

    return filteredPosts;
  }, [posts, activeTab, followingIds, user?.uid]);

  const feedData = getFeedData();

  const renderItem = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        currentUserId={user?.uid}
        onPress={handlePostPress}
        onComment={handlePostPress}
        onUserPress={handleUserPress}
      />
    ),
    [colors, user]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  // Listen to Firestore posts collection
  useFocusEffect(
    useCallback(() => {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
        setLoading(false);
      });
      return () => unsubscribe();
    }, [])
  );

  // Load following list for the "Following" tab
  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      const unsubscribe = userService.listenToProfile(user.uid, (profile) => {
        setFollowingIds(profile?.following || []);
      });
      return () => unsubscribe();
    }, [user?.uid])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerSmall, { color: colors.textMuted }]}>
            your feed
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            UNI
            <Text style={{ color: colors.accent }}>SPHERE</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserSearch')}
            style={[styles.searchBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Ionicons name="search" size={18} color={colors.text} />
          </TouchableOpacity>
          <View
            style={[
              styles.liveBadge,
              { backgroundColor: colors.accentGreen, borderColor: colors.border },
            ]}
          >
            <Text style={styles.liveText}>● LIVE</Text>
          </View>
        </View>
      </View>

      {/* Feed Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        {FEED_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.feedTab,
                isActive && { borderBottomWidth: 3, borderBottomColor: colors.accent },
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? colors.accent : colors.textMuted}
              />
              <Text
                style={[
                  styles.feedTabText,
                  { color: isActive ? colors.accent : colors.textMuted },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={() => navigation.navigate('ConfessionWall')}
          style={styles.feedTab}
        >
          <Ionicons name="eye-off-outline" size={16} color={colors.accentPink} />
          <Text style={[styles.feedTabText, { color: colors.accentPink }]}>
            Confess
          </Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : feedData.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name={activeTab === 'following' ? 'people-outline' : 'newspaper-outline'}
            size={56}
            color={colors.textMuted}
            style={{ opacity: 0.4, marginBottom: SPACING.md }}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {activeTab === 'following' ? 'NO FOLLOWING POSTS' : 'NO POSTS YET'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {activeTab === 'following'
              ? 'Follow users to see their posts here'
              : 'Be the first to share something'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={feedData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          removeClippedSubviews
          maxToRenderPerBatch={8}
          windowSize={10}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    borderBottomWidth: 2.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSmall: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  headerTitle: {
    fontSize: FONTS.titleSize,
    fontWeight: FONTS.black,
    letterSpacing: -1.5,
  },
  liveBadge: {
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  liveText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    color: '#000',
    letterSpacing: 1,
  },

  // Feed tabs
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  feedTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 4,
    gap: 6,
  },
  feedTabText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: 100,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
    letterSpacing: -1,
  },
  emptyText: {
    fontSize: FONTS.captionSize,
    marginTop: SPACING.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default HomeFeedScreen;
