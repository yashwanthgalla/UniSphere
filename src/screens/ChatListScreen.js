import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import { chatService } from '../services/firestore';
import { useFocusEffect } from '@react-navigation/native';

const ChatListScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Listen to user's conversations
  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      const unsubscribe = chatService.listenToConversations(user.uid, (convos) => {
        setConversations(convos);
        setLoading(false);
      });
      return () => unsubscribe();
    }, [user?.uid])
  );

  // Search users to start new chat
  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const results = await chatService.searchUsers(text.trim(), user.uid);
      setSearchResults(results);
    } catch (e) {
      console.error('Search error:', e);
    }
    setSearching(false);
  };

  // Start or open a conversation with a user
  const handleStartChat = async (otherUser) => {
    try {
      const convoId = await chatService.getOrCreateConversation(user.uid, otherUser.id, {
        uid: user.uid,
        username: user.displayName || 'Anonymous',
      }, {
        uid: otherUser.id,
        username: otherUser.username || otherUser.displayName || 'User',
      });
      setSearchQuery('');
      setSearchResults([]);
      navigation.navigate('ChatRoom', {
        conversationId: convoId,
        otherUser: {
          uid: otherUser.id,
          username: otherUser.username || otherUser.displayName || 'User',
          avatar: otherUser.avatar || null,
        },
      });
    } catch (e) {
      console.error('Start chat error:', e);
    }
  };

  // Open existing conversation
  const handleOpenChat = (convo) => {
    const otherParticipant = convo.participantDetails?.find(p => p.uid !== user.uid) || {};
    navigation.navigate('ChatRoom', {
      conversationId: convo.id,
      otherUser: {
        uid: otherParticipant.uid,
        username: otherParticipant.username || 'User',
        avatar: otherParticipant.avatar || null,
      },
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'NOW';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const renderConversation = ({ item }) => {
    const other = item.participantDetails?.find(p => p.uid !== user.uid) || {};
    const unread = item.unreadCount?.[user.uid] || 0;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleOpenChat(item)}
        style={[
          styles.convoCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
          unread > 0 && { borderLeftWidth: 5, borderLeftColor: colors.accent },
        ]}
      >
        {/* Avatar */}
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: unread > 0 ? colors.accent : colors.accentAlt,
              borderColor: colors.border,
            },
          ]}
        >
          {other.avatar ? (
            <Image source={{ uri: other.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {(other.username || 'U').charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Info */}
        <View style={styles.convoInfo}>
          <View style={styles.convoHeader}>
            <Text
              style={[
                styles.convoName,
                { color: colors.text },
                unread > 0 && { color: colors.accent },
              ]}
              numberOfLines={1}
            >
              {other.username || 'User'}
            </Text>
            <Text style={[styles.convoTime, { color: colors.textMuted }]}>
              {formatTime(item.lastMessageAt)}
            </Text>
          </View>
          <View style={styles.convoPreviewRow}>
            <Text
              style={[
                styles.convoPreview,
                { color: unread > 0 ? colors.text : colors.textSecondary },
                unread > 0 && { fontWeight: FONTS.bold },
              ]}
              numberOfLines={1}
            >
              {item.lastMessage || 'Start chatting...'}
            </Text>
            {unread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.accent, borderColor: colors.border }]}>
                <Text style={styles.unreadText}>{unread > 99 ? '99+' : unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => handleStartChat(item)}
      style={[
        styles.searchResultCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: colors.accentGreen, borderColor: colors.border },
        ]}
      >
        <Text style={styles.avatarText}>
          {(item.username || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.searchInfo}>
        <Text style={[styles.searchName, { color: colors.text }]}>
          {item.username || item.displayName || 'User'}
        </Text>
        {item.university && (
          <View style={[styles.uniTag, { backgroundColor: colors.accentAlt }]}>
            <Text style={styles.uniTagText}>{item.university}</Text>
          </View>
        )}
      </View>
      <View style={[styles.chatStartBtn, { backgroundColor: colors.accent, borderColor: colors.border }]}>
        <Ionicons name="chatbubble" size={14} color="#FFF" />
      </View>
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
        <View>
          <Text style={[styles.headerSmall, { color: colors.textMuted }]}>
            messages
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            CHAT<Text style={{ color: colors.accent }}>S</Text>
          </Text>
        </View>
        <View style={[styles.onlineBadge, { backgroundColor: colors.accentGreen, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="radio-button-on" size={10} color="#000" />
            <Text style={styles.onlineText}>ONLINE</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.inputBg, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="SEARCH USERS..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <View style={styles.searchResultsWrapper}>
          {searching ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.searchingText, { color: colors.textMuted }]}>SEARCHING...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.searchResultsList}
            />
          ) : (
            <View style={styles.centerLoading}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>NO USERS FOUND</Text>
            </View>
          )}
        </View>
      )}

      {/* Conversations List */}
      {searchQuery.length < 2 && (
        <>
          {loading ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>LOADING CHATS...</Text>
            </View>
          ) : conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>NO CHATS YET</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Search for a user above to start a conversation
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              renderItem={renderConversation}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
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
  onlineBadge: {
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  onlineText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    color: '#000',
    letterSpacing: 1,
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
    height: 44,
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
    textTransform: 'uppercase',
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: 16,
    fontWeight: FONTS.black,
    padding: SPACING.xs,
  },

  // Search results
  searchResultsWrapper: {
    flex: 1,
  },
  searchResultsList: {
    padding: SPACING.md,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.brutalSmall,
  },
  searchInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  searchName: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  uniTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  uniTagText: {
    color: '#FFF',
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chatStartBtn: {
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  chatStartText: {
    color: '#FFF',
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 1.5,
  },
  centerLoading: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  searchingText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
  },

  // Convo list
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  convoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.brutalSmall,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
  },
  avatarText: {
    color: '#FFF',
    fontSize: FONTS.subheadingSize,
    fontWeight: FONTS.black,
  },
  convoInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  convoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convoName: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    flex: 1,
  },
  convoTime: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    letterSpacing: 1,
    marginLeft: SPACING.sm,
  },
  convoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  convoPreview: {
    fontSize: FONTS.captionSize,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#FFF',
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
  },

  // Empty
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.brutal,
  },
  emptyTitle: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
    letterSpacing: -1,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONTS.captionSize,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.bold,
    letterSpacing: 1,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
  },
});

export default ChatListScreen;
