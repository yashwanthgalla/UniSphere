import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import ProfileHeader from '../components/ProfileHeader';
import PostCard from '../components/PostCard';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, onSnapshot, doc, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const handlePostPress = (post) => {
    navigation.navigate('Comments', { post });
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleUserPress = (postUser) => {
    if (postUser?.userId && postUser.userId !== user?.uid) {
      navigation.navigate('UserProfile', { userId: postUser.userId });
    }
  };

  const TABS = [
    { key: 'posts', label: 'Posts', icon: 'grid-outline' },
    { key: 'liked', label: 'Liked', icon: 'heart-outline' },
    { key: 'bookmarks', label: 'Saved', icon: 'bookmark-outline' },
  ];

  const renderHeader = () => (
    <View>
      <ProfileHeader
        user={user}
        profile={profile ? { ...profile, postCount: userPosts.length } : null}
        onEditProfile={handleEditProfile}
        isOwnProfile={true}
        onFollowers={() => {}}
        onFollowing={() => {}}
      />

      {/* Tab bar */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tab,
              activeTab === tab.key && {
                borderBottomWidth: 3,
                borderBottomColor: colors.accent,
              },
            ]}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? colors.accent : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.key ? colors.accent : colors.textMuted,
                },
              ]}
            >
              {tab.label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getActiveData = () => {
    if (activeTab === 'posts') return userPosts;
    if (activeTab === 'liked') return likedPosts;
    if (activeTab === 'bookmarks') return bookmarkedPosts;
    return [];
  };

  const getEmptyMessage = () => {
    if (activeTab === 'posts') return { title: 'NO POSTS YET', sub: 'create your first post to see it here', icon: 'camera-outline' };
    if (activeTab === 'liked') return { title: 'NO LIKES YET', sub: 'posts you like will appear here', icon: 'heart-outline' };
    if (activeTab === 'bookmarks') return { title: 'NO SAVED POSTS', sub: 'bookmark posts to save them here', icon: 'bookmark-outline' };
    return { title: 'EMPTY', sub: '', icon: 'alert-circle-outline' };
  };

  // Listen to Firestore profile
  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
        if (snap.exists()) {
          setProfile({ id: snap.id, ...snap.data() });
        }
        setLoading(false);
      });
      return () => unsubProfile();
    }, [user?.uid])
  );

  // Listen to Firestore posts for this user
  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUserPosts(postsData);
      });
      return () => unsubscribe();
    }, [user?.uid])
  );

  // Listen to bookmarked posts
  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      const q = query(
        collection(db, 'posts'),
        where('bookmarkedBy', 'array-contains', user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setBookmarkedPosts(postsData);
      });
      return () => unsubscribe();
    }, [user?.uid])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const emptyMsg = getEmptyMessage();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerUsername, { color: colors.text }]}>
            {profile?.username || user?.displayName || 'Profile'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.text} style={{ marginLeft: 4 }} />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePost')}
            style={styles.headerBtn}
          >
            <Ionicons name="add-circle-outline" size={26} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.headerBtn}
          >
            <Ionicons name="menu-outline" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={getActiveData()}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={user?.uid}
            onPress={handlePostPress}
            onComment={handlePostPress}
            onUserPress={() => handleUserPress({ userId: item.userId })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name={emptyMsg.icon}
              size={48}
              color={colors.textMuted}
              style={{ marginBottom: SPACING.md, opacity: 0.4 }}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {emptyMsg.title}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {emptyMsg.sub}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 50,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 0.5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerUsername: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONTS.subheadingSize,
    fontWeight: FONTS.black,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: FONTS.captionSize,
    marginTop: SPACING.xs,
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
