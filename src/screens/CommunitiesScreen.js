import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import CommunityCard from '../components/CommunityCard';
import { communityService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

const FILTER_ICONS = {
  ALL: 'apps-outline',
  JOINED: 'checkmark-circle-outline',
  TRENDING: 'trending-up-outline',
};

const CommunitiesScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Real-time listener for all communities
  useEffect(() => {
    const unsubscribe = communityService.listenAll((comms) => {
      setCommunities(comms);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter communities
  const filtered = communities.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === 'JOINED') {
      return matchesSearch && c.members?.includes(user?.uid);
    }
    if (activeFilter === 'TRENDING') {
      return matchesSearch; // sort by memberCount below
    }
    return matchesSearch;
  });

  // Sort trending by member count
  const sortedFiltered = activeFilter === 'TRENDING'
    ? [...filtered].sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
    : filtered;

  const handleJoin = async (community) => {
    if (!user?.uid) return;
    const isMember = community.members?.includes(user.uid);
    try {
      if (isMember) {
        await communityService.leave(community.id, user.uid);
      } else {
        await communityService.join(community.id, user.uid);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update membership.');
    }
  };

  const handlePress = (community) => {
    navigation.navigate('CommunityFeed', { community });
  };

  const renderItem = useCallback(
    ({ item }) => (
      <CommunityCard
        community={item}
        onPress={handlePress}
        onJoin={handleJoin}
        isJoined={item.members?.includes(user?.uid)}
      />
    ),
    [user, communities]
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
          explore
        </Text>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            COMMU
            <Text style={{ color: colors.accentAlt }}>NITIES</Text>
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateCommunity')}
            style={[styles.createBtn, { backgroundColor: colors.accent, borderColor: colors.border }]}
          >
            <Text style={styles.createBtnText}>+ NEW</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search communities..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tags */}
      <View style={styles.tagsRow}>
        {['ALL', 'JOINED', 'TRENDING'].map((tag) => {
          const isActive = activeFilter === tag;
          return (
            <TouchableOpacity
              key={tag}
              onPress={() => setActiveFilter(tag)}
              style={[
                styles.tag,
                {
                  backgroundColor: isActive ? colors.accent : colors.inputBg,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
            >
              <Ionicons
                name={FILTER_ICONS[tag]}
                size={14}
                color={isActive ? '#FFF' : colors.textMuted}
              />
              <Text
                style={[
                  styles.tagText,
                  { color: isActive ? '#FFF' : colors.text },
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading communities...</Text>
        </View>
      ) : (
        <FlatList
          data={sortedFiltered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name={activeFilter === 'JOINED' ? 'people-outline' : 'search-outline'}
                size={48}
                color={colors.textMuted}
                style={{ marginBottom: SPACING.md, opacity: 0.3 }}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {activeFilter === 'JOINED' ? 'NOT A MEMBER YET' : 'NOTHING FOUND'}
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {activeFilter === 'JOINED'
                  ? 'join communities to see them here'
                  : 'try a different search term'}
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
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    borderBottomWidth: 2.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  createBtn: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },
  searchWrap: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.bold,
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    gap: 4,
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
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.bold,
    marginTop: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
