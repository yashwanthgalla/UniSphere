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
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const ConfessionWallScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [confessions, setConfessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
    [colors, user]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  // Listen to confession-type posts only
  useFocusEffect(
    useCallback(() => {
      const q = query(
        collection(db, 'posts'),
        where('postType', '==', 'confession'),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setConfessions(data);
        setLoading(false);
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
      <View style={[styles.header, { borderBottomColor: colors.accentPink }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="eye-off" size={22} color={colors.accentPink} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              CONFESSION{' '}
              <Text style={{ color: colors.accentPink }}>WALL</Text>
            </Text>
          </View>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            anonymous · unfiltered · real
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatePost')}
          style={[styles.confessBtn, { backgroundColor: colors.accentPink, borderColor: colors.border }]}
        >
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={[styles.disclaimer, { backgroundColor: colors.accentPink + '10', borderBottomColor: colors.border }]}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.accentPink} />
        <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
          All confessions are 100% anonymous. Be kind.
        </Text>
      </View>

      {/* Confessions */}
      {loading ? (
        <View style={styles.loadingState}>
          <Ionicons name="eye-off-outline" size={48} color={colors.textMuted} style={{ opacity: 0.3 }} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading confessions...</Text>
        </View>
      ) : (
        <FlatList
          data={confessions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accentPink}
              colors={[colors.accentPink]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="eye-off-outline" size={56} color={colors.accentPink} style={{ opacity: 0.3, marginBottom: SPACING.md }} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                NO CONFESSIONS YET
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Be the first to share your secret
              </Text>
            </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    borderBottomWidth: 2.5,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.medium,
    textTransform: 'lowercase',
    letterSpacing: 2,
    marginTop: 2,
  },
  confessBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    gap: 6,
  },
  disclaimerText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.medium,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: 100,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.medium,
    textTransform: 'lowercase',
    letterSpacing: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
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

export default ConfessionWallScreen;
