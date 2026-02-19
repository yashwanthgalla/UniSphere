import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import CommentItem from '../components/CommentItem';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const CommentsScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { post } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const { user } = useAuth();
  const inputRef = useRef(null);

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setNewComment('');
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };

  const handleSend = async () => {
    if (!newComment.trim()) return;
    try {
      await addDoc(collection(db, 'comments'), {
        postId: post.id,
        userId: user?.uid,
        username: user?.displayName || 'anon',
        university: user?.university || '',
        text: newComment.trim(),
        parentId: replyingTo?.id || null,
        likes: 0,
        createdAt: serverTimestamp(),
      });
      // Increment post comment count
      await updateDoc(doc(db, 'posts', post.id), {
        commentsCount: increment(1),
      });
    } catch (e) {}
    setNewComment('');
    setReplyingTo(null);
  };

  // Listen to Firestore comments for this post
  useFocusEffect(
    React.useCallback(() => {
      const q = query(
        collection(db, 'comments'),
        where('postId', '==', post.id),
        orderBy('createdAt', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setComments(commentsData);
      });
      return () => unsubscribe();
    }, [post.id])
  );

  // Build threaded structure
  const rootComments = comments.filter((c) => !c.parentId);
  const childMap = {};
  comments.forEach((c) => {
    if (c.parentId) {
      if (!childMap[c.parentId]) childMap[c.parentId] = [];
      childMap[c.parentId].push(c);
    }
  });

  const flatThreaded = [];
  const addWithChildren = (comment, depth = 0) => {
    flatThreaded.push({ ...comment, depth });
    (childMap[comment.id] || []).forEach((child) =>
      addWithChildren(child, depth + 1)
    );
  };
  rootComments.forEach((c) => addWithChildren(c));

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            COM<Text style={{ color: colors.accent }}>MENTS</Text>
          </Text>
          <Text style={[styles.commentCount, { color: colors.textMuted }]}>
            {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Original post summary */}
      <View
        style={[
          styles.postSummary,
          { backgroundColor: colors.inputBg, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.postSummaryHeader}>
          <Ionicons name="chatbubble" size={14} color={colors.accent} />
          <Text style={[styles.postUser, { color: colors.accent }]}>
            {post.username}
          </Text>
        </View>
        <Text
          style={[styles.postText, { color: colors.text }]}
          numberOfLines={3}
        >
          {post.text}
        </Text>
      </View>

      {/* Comments list */}
      <FlatList
        data={flatThreaded}
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            depth={item.depth}
            onReply={handleReply}
            currentUserId={user?.uid}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} style={{ opacity: 0.3, marginBottom: SPACING.md }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              NO COMMENTS
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              start the conversation
            </Text>
          </View>
        }
      />

      {/* Reply-to banner */}
      {replyingTo && (
        <View style={[styles.replyBanner, { backgroundColor: colors.inputBg, borderTopColor: colors.accent }]}>
          <View style={styles.replyInfo}>
            <Ionicons name="return-down-forward" size={14} color={colors.accent} />
            <Text style={[styles.replyText, { color: colors.textMuted }]} numberOfLines={1}>
              Replying to <Text style={{ color: colors.accent, fontWeight: FONTS.black }}>{replyingTo.username}</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={cancelReply}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={newComment}
          onChangeText={setNewComment}
          placeholder={replyingTo ? `reply to ${replyingTo.username}...` : 'drop a comment...'}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            },
          ]}
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendBtn,
            {
              backgroundColor: newComment.trim()
                ? colors.accent
                : colors.inputBg,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="send"
            size={18}
            color={newComment.trim() ? '#FFF' : colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2.5,
  },
  headerTitle: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
    letterSpacing: -1,
  },
  commentCount: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  postSummary: {
    padding: SPACING.md,
    borderBottomWidth: 2.5,
  },
  postSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  postUser: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },
  postText: {
    fontSize: FONTS.bodySize,
    lineHeight: 20,
  },
  listContent: {
    padding: SPACING.md,
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
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 2,
  },
  replyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  replyText: {
    fontSize: FONTS.captionSize,
    flex: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    paddingBottom: SPACING.lg,
    borderTopWidth: 2.5,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.bodySize,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentsScreen;
