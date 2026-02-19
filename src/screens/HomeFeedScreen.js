import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING } from '../theme';
import PostCard from '../components/PostCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const AD_INTERVAL = 4; // Show ad every N posts

const AdPlaceholder = ({ colors }) => (
  <View
    style={[
      styles.adCard,
      { backgroundColor: colors.inputBg, borderColor: colors.border },
    ]}
  >
    <Text style={[styles.adLabel, { color: colors.textMuted }]}>
      ADVERTISEMENT
    </Text>
    <Text style={[styles.adText, { color: colors.textSecondary }]}>
      AdMob Banner — 320×50
    </Text>
  </View>
);

const HomeFeedScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Insert ads between posts
  const feedData = [];
  posts.forEach((post, index) => {
    feedData.push({ type: 'post', data: post });
    if ((index + 1) % AD_INTERVAL === 0 && index < posts.length - 1) {
      feedData.push({ type: 'ad', id: `ad_${index}` });
    }
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Firestore will update automatically via onSnapshot
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const onEndReached = useCallback(() => {
    // TODO: Implement Firestore pagination if needed
  }, []);

  const handlePostPress = (post) => {
    navigation.navigate('Comments', { post });
  };

  const handleLike = (postId, liked) => {
    // TODO: Implement like/unlike with Firestore
    console.log('Like:', postId, liked);
  };

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === 'ad') {
        return <AdPlaceholder colors={colors} />;
      }
      return (
        <PostCard
          post={item.data}
          currentUserId={user?.uid}
          onPress={handlePostPress}
          onLike={handleLike}
          onComment={handlePostPress}
        />
      );
    },
    [colors, user]
  );

  const keyExtractor = useCallback(
    (item) => (item.type === 'ad' ? item.id : item.data.id),
    []
  );

  // Listen to Firestore posts collection
  useFocusEffect(
    useCallback(() => {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
      });
      return () => unsubscribe();
    }, [])
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
        <View
          style={[
            styles.liveBadge,
            { backgroundColor: colors.accentGreen, borderColor: colors.border },
          ]}
        >
          <Text style={styles.liveText}>● LIVE</Text>
        </View>
      </View>

      {/* Feed */}
      {posts.length === 0 ? (
        <LoadingSkeleton count={4} />
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
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          removeClippedSubviews
          maxToRenderPerBatch={8}
          windowSize={10}
          ListFooterComponent={
            loading ? (
              <Text style={[styles.loadingMore, { color: colors.textMuted }]}>
                LOADING MORE...
              </Text>
            ) : null
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    borderBottomWidth: 2.5,
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
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: 100,
  },
  adCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderRadius: 4,
    borderStyle: 'dashed',
    padding: SPACING.md,
    alignItems: 'center',
  },
  adLabel: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
    marginBottom: 4,
  },
  adText: {
    fontSize: FONTS.captionSize,
  },
  loadingMore: {
    textAlign: 'center',
    paddingVertical: SPACING.lg,
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
  },
});

export default HomeFeedScreen;
