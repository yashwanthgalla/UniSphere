import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import ProfileHeader from '../components/ProfileHeader';
import PostCard from '../components/PostCard';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const { user } = useAuth();

  const handlePostPress = (post) => {
    navigation.navigate('Comments', { post });
  };

  const renderHeader = () => (
    <View>
      <ProfileHeader user={user} />

      {/* Tab bar */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {['posts', 'communities'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomWidth: 3,
                borderBottomColor: colors.accent,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? colors.accent : colors.textMuted,
                },
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsBtn}
        >
          <Text style={[styles.settingsIcon, { color: colors.text }]}>⚙</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Listen to Firestore posts for this user
  useFocusEffect(
    React.useCallback(() => {
      if (!user?.uid) return;
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUserPosts(postsData);
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
        <Text style={[styles.headerSmall, { color: colors.textMuted }]}>
          your identity
        </Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          PRO<Text style={{ color: colors.accent }}>FILE</Text>
        </Text>
      </View>

      <FlatList
        data={activeTab === 'posts' ? userPosts : []}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={user?.uid}
            onPress={handlePostPress}
            onComment={handlePostPress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {activeTab === 'posts' ? 'NO POSTS YET' : 'NO COMMUNITIES'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {activeTab === 'posts'
                ? 'create your first post'
                : 'join a community to get started'}
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
  header: {
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 2.5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  tabText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1.5,
  },
  settingsBtn: {
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
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

export default ProfileScreen;
