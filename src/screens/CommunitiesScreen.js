import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import CommunityCard from '../components/CommunityCard';
import { useFocusEffect } from '@react-navigation/native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const CommunitiesScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const { user } = useAuth();

  const filtered = communities.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const handleJoin = (community) => {
    // TODO: Implement join/leave logic with Firestore and user.followedCommunities
    setJoinedIds((prev) => {
      const next = new Set(prev);
      if (next.has(community.id)) {
        next.delete(community.id);
      } else {
        next.add(community.id);
      }
      return next;
    });
  };

  const handlePress = (community) => {
      // Listen to Firestore communities collection
      useFocusEffect(
        React.useCallback(() => {
          const unsubscribe = onSnapshot(collection(db, 'communities'), (snapshot) => {
            const comms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setCommunities(comms);
            // Optionally, update joinedIds from user profile if available
          });
          return () => unsubscribe();
        }, [user])
      );
    navigation.navigate('CommunityFeed', { community });
  };

  const renderItem = useCallback(
    ({ item }) => (
      <CommunityCard
        community={item}
        onPress={handlePress}
        onJoin={handleJoin}
        isJoined={joinedIds.has(item.id)}
      />
    ),
    [joinedIds]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}> 
      {/* Create Community Button */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: colors.accent,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: 'center',
            marginBottom: 8,
          }}
          onPress={() => navigation.navigate('CreateCommunity')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            + Create Community
          </Text>
        </TouchableOpacity>
      </View>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerSmall, { color: colors.textMuted }]}>
          explore
        </Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          COMMU
          <Text style={{ color: colors.accentAlt }}>NITIES</Text>
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="SEARCH COMMUNITIES..."
          placeholderTextColor={colors.textMuted}
          style={[
            styles.searchInput,
            {
              color: colors.text,
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            },
          ]}
        />
      </View>

      {/* Tags */}
      <View style={styles.tagsRow}>
        {['ALL', 'JOINED', 'TRENDING'].map((tag, i) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tag,
              {
                backgroundColor: i === 0 ? colors.accent : colors.inputBg,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                { color: i === 0 ? '#FFF' : colors.text },
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              NOTHING FOUND
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              try a different search term
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
  searchWrap: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  searchInput: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.bold,
    letterSpacing: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tag: {
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  },
  tagText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 1.5,
  },
  listContent: {
    paddingTop: SPACING.xs,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
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

export default CommunitiesScreen;
