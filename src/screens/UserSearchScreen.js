import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import { userService, socialService } from '../services/firestore';

const UserSearchScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [relationships, setRelationships] = useState({});

  const handleSearch = useCallback(async (text) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const users = await userService.searchUsers(text.trim(), user.uid);

      // Load relationships for all results
      const rels = {};
      for (const u of users) {
        try {
          const rel = await socialService.getRelationship(user.uid, u.id);
          rels[u.id] = rel;
        } catch (e) { /* ignore */ }
      }
      setRelationships(rels);
      setResults(users);
    } catch (e) {
      console.error('Search error:', e);
    }
    setSearching(false);
  }, [user?.uid]);

  const handleFollow = async (targetUserId) => {
    const rel = relationships[targetUserId] || {};
    try {
      if (rel.isFollowing) {
        await socialService.unfollow(user.uid, targetUserId);
        setRelationships((prev) => ({
          ...prev,
          [targetUserId]: { ...prev[targetUserId], isFollowing: false },
        }));
      } else {
        await socialService.follow(user.uid, targetUserId);
        setRelationships((prev) => ({
          ...prev,
          [targetUserId]: { ...prev[targetUserId], isFollowing: true },
        }));
      }
    } catch (e) {
      console.error('Follow error:', e);
    }
  };

  const handleUserPress = (userId) => {
    navigation.navigate('UserProfile', { userId });
  };

  const getFollowLabel = (userId) => {
    const rel = relationships[userId] || {};
    if (rel.isFollowing) return 'FOLLOWING';
    if (rel.isFollower) return 'FOLLOW BACK';
    return 'FOLLOW';
  };

  const getFollowColor = (userId) => {
    const rel = relationships[userId] || {};
    if (rel.isFollowing) return colors.accentGreen;
    if (rel.isFollower) return colors.accentAlt;
    return colors.accent;
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => handleUserPress(item.id)}
      style={[
        styles.userCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          { backgroundColor: colors.accent, borderColor: colors.border },
        ]}
      >
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>
            {(item.username || 'U').charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
          {item.username || item.displayName || 'User'}
        </Text>
        <View style={styles.userMeta}>
          {item.university && (
            <View style={[styles.uniTag, { backgroundColor: colors.accentAlt }]}>
              <Text style={styles.uniTagText}>{item.university}</Text>
            </View>
          )}
          <Text style={[styles.followerCount, { color: colors.textMuted }]}>
            {(item.followers || []).length} followers
          </Text>
        </View>
        {item.bio ? (
          <Text style={[styles.userBio, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.bio}
          </Text>
        ) : null}
      </View>

      {/* Follow Button */}
      <TouchableOpacity
        onPress={() => handleFollow(item.id)}
        style={[
          styles.followBtn,
          {
            backgroundColor: getFollowColor(item.id),
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={styles.followBtnText}>{getFollowLabel(item.id)}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { borderColor: colors.border }]}
        >
          <Text style={[styles.backText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          FIND <Text style={{ color: colors.accent }}>PEOPLE</Text>
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.inputBg, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.searchIcon, { color: colors.textMuted }]}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="SEARCH BY USERNAME..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            autoCapitalize="none"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Text style={[styles.clearBtn, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {searching ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.stateText, { color: colors.textMuted }]}>SEARCHING...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : query.length >= 2 ? (
        <View style={styles.centerState}>
          <Text style={{ fontSize: 48 }}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>NO USERS FOUND</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Try a different username
          </Text>
        </View>
      ) : (
        <View style={styles.centerState}>
          <Text style={{ fontSize: 48 }}>👥</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>DISCOVER PEOPLE</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Search by username to find and follow people
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONTS.subheadingSize,
    fontWeight: FONTS.black,
    letterSpacing: -0.5,
  },

  // Search
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    height: 48,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
    fontWeight: FONTS.black,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.bold,
    letterSpacing: 1,
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: 16,
    fontWeight: FONTS.black,
    padding: SPACING.xs,
  },

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.brutalSmall,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 52, height: 52, borderRadius: RADIUS.full },
  avatarText: {
    color: '#FFF',
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  userName: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 3,
    flexWrap: 'wrap',
  },
  uniTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  uniTagText: {
    color: '#FFF',
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  followerCount: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    letterSpacing: 0.5,
  },
  userBio: {
    fontSize: FONTS.captionSize,
    marginTop: 3,
  },
  followBtn: {
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    marginLeft: SPACING.sm,
  },
  followBtnText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },

  // States
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  stateText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
    marginTop: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
    letterSpacing: -1,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONTS.captionSize,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default UserSearchScreen;
