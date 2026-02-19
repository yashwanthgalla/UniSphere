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
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import PostCard from '../components/PostCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const CommunityFeedScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { community } = route.params;
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handlePostPress = (post) => {
    navigation.navigate('Comments', { post });
  };

  const renderItem = useCallback(
    ({ item }) => (
      <PostCard
        post={item}
        currentUserId={user?.uid}
        onPress={handlePostPress}
        onComment={handlePostPress}
      />
    ),
    [user]
  );
  // Listen to Firestore posts for this community
  useFocusEffect(
    React.useCallback(() => {
      const q = query(
        collection(db, 'posts'),
        where('communityId', '==', community.id),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
      });
      return () => unsubscribe();
    }, [community.id])
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
          <Text style={[styles.backBtn, { color: colors.text }]}>← BACK</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.communityIcon}>{community.icon}</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {community.name?.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.memberCount, { color: colors.textMuted }]}>
            {community.memberCount?.toLocaleString()} members
          </Text>
        </View>
      </View>

      {/* Description banner */}
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

      {/* Posts */}
      {posts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            NO POSTS YET
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            be the first to post here
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    borderBottomWidth: 2.5,
  },
  backBtn: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
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
  memberCount: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
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
});

export default CommunityFeedScreen;
