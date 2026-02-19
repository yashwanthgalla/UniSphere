import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Image,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import { chatService } from '../services/firestore';

const ChatRoomScreen = ({ route, navigation }) => {
  const { conversationId, otherUser } = route.params;
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const sendScale = useRef(new Animated.Value(1)).current;

  // Listen for messages in real-time
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = chatService.listenToMessages(conversationId, (msgs) => {
      setMessages(msgs);
    });

    // Mark messages as read
    chatService.markConversationRead(conversationId, user.uid);

    return () => unsubscribe();
  }, [conversationId, user?.uid]);

  // Send a message
  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !conversationId) return;

    setSending(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(sendScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(sendScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    setInput('');

    try {
      await chatService.sendMessage(conversationId, {
        text,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
      });
    } catch (e) {
      console.error('Send message error:', e);
      setInput(text); // Restore text on error
    }
    setSending(false);
  };

  // Group messages by date
  const getDateLabel = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = today - msgDate;

    if (diff === 0) return 'TODAY';
    if (diff <= 86400000) return 'YESTERDAY';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.senderId === user.uid;
    const showDate = index === 0 ||
      getDateLabel(item.createdAt) !== getDateLabel(messages[index - 1]?.createdAt);

    // Check if consecutive message from same sender (for grouping)
    const isConsecutive = index > 0 && messages[index - 1]?.senderId === item.senderId && !showDate;

    return (
      <View>
        {/* Date separator */}
        {showDate && (
          <View style={styles.dateSeparator}>
            <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
            <View style={[styles.dateBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {getDateLabel(item.createdAt)}
              </Text>
            </View>
            <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
          </View>
        )}

        {/* Message bubble */}
        <View
          style={[
            styles.messageRow,
            isMe ? styles.messageRowRight : styles.messageRowLeft,
            !isConsecutive ? { marginTop: SPACING.sm } : { marginTop: 3 },
          ]}
        >
          {/* Other user avatar (only on first of group) */}
          {!isMe && !isConsecutive && (
            <View
              style={[
                styles.msgAvatar,
                { backgroundColor: colors.accentAlt, borderColor: colors.border },
              ]}
            >
              <Text style={styles.msgAvatarText}>
                {(otherUser?.username || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {!isMe && isConsecutive && <View style={styles.msgAvatarSpacer} />}

          <View
            style={[
              styles.bubble,
              isMe
                ? [
                    styles.bubbleRight,
                    {
                      backgroundColor: colors.accent,
                      borderColor: colors.border,
                    },
                  ]
                : [
                    styles.bubbleLeft,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ],
              !isConsecutive && (isMe ? styles.bubbleRightFirst : styles.bubbleLeftFirst),
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: isMe ? '#FFFFFF' : colors.text },
              ]}
            >
              {item.text}
            </Text>
            <Text
              style={[
                styles.timeText,
                { color: isMe ? 'rgba(255,255,255,0.6)' : colors.textMuted },
              ]}
            >
              {formatTime(item.createdAt)}
              {isMe && (
                <Text> {item.read ? ' ✓✓' : ' ✓'}</Text>
              )}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View
            style={[
              styles.headerAvatar,
              { backgroundColor: colors.accentAlt, borderColor: colors.border },
            ]}
          >
            {otherUser?.avatar ? (
              <Image source={{ uri: otherUser.avatar }} style={styles.headerAvatarImg} />
            ) : (
              <Text style={styles.headerAvatarText}>
                {(otherUser?.username || 'U').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: colors.text }]} numberOfLines={1}>
              {otherUser?.username || 'User'}
            </Text>
            <View style={styles.headerStatus}>
              <View style={[styles.statusDot, { backgroundColor: colors.accentGreen }]} />
              <Text style={[styles.statusText, { color: colors.textMuted }]}>ONLINE</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.moreBtn, { borderColor: colors.border }]}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <View style={[styles.emptyChatIcon, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Ionicons name="hand-right-outline" size={40} color={colors.accent} />
            </View>
            <Text style={[styles.emptyChatTitle, { color: colors.text }]}>
              SAY HELLO!
            </Text>
            <Text style={[styles.emptyChatSub, { color: colors.textSecondary }]}>
              Start a conversation with {otherUser?.username || 'this user'}
            </Text>
          </View>
        }
      />

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text }]}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>

          <Animated.View style={{ transform: [{ scale: sendScale }] }}>
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || sending}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: input.trim() ? colors.accent : colors.inputBg,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="arrow-up"
                size={22}
                color={input.trim() ? '#FFF' : colors.textMuted}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

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
  backText: {
    fontSize: 22,
    fontWeight: FONTS.black,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerAvatarImg: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
  },
  headerAvatarText: {
    color: '#FFF',
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
  },
  headerInfo: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  headerName: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.full,
    marginRight: 4,
  },
  statusText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    letterSpacing: 1,
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 22,
    fontWeight: FONTS.black,
  },

  // Messages
  messagesList: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
    marginTop: 2,
  },
  msgAvatarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: FONTS.black,
  },
  msgAvatarSpacer: {
    width: 30,
    marginRight: SPACING.xs,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    borderRadius: RADIUS.sm,
  },
  bubbleLeft: {
    borderTopLeftRadius: RADIUS.sm,
  },
  bubbleRight: {
    borderTopRightRadius: RADIUS.sm,
  },
  bubbleLeftFirst: {
    borderTopLeftRadius: 0,
    ...SHADOWS.brutalSmall,
  },
  bubbleRightFirst: {
    borderTopRightRadius: 0,
    ...SHADOWS.brutalSmall,
  },
  messageText: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.medium,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 9,
    fontWeight: FONTS.bold,
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'right',
  },

  // Date separators
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dateLine: {
    flex: 1,
    height: 1.5,
  },
  dateBadge: {
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginHorizontal: SPACING.sm,
  },
  dateText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
  },

  // Empty chat
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyChatIcon: {
    width: 80,
    height: 80,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.brutal,
  },
  emptyChatTitle: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
    letterSpacing: -1,
    marginBottom: SPACING.xs,
  },
  emptyChatSub: {
    fontSize: FONTS.captionSize,
    textAlign: 'center',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 2.5,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.medium,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : SPACING.xs,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    ...SHADOWS.brutalSmall,
  },
  sendIcon: {
    fontSize: 22,
    fontWeight: FONTS.black,
  },
});

export default ChatRoomScreen;
