import React, { useState } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import CommentItem from '../components/CommentItem';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { generateUsername } from '../utils/helpers';

const CommentsScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { post } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const handleSend = async () => {
    if (!newComment.trim()) return;
    await addDoc(collection(db, 'comments'), {
      postId: post.id,
      userId: user?.uid,
      username: user?.displayName || 'anon',
      university: user?.university || '',
      text: newComment.trim(),
      parentId: null,
      createdAt: serverTimestamp(),
    });
    setNewComment('');
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
          <Text style={[styles.backBtn, { color: colors.text }]}>← BACK</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          COM<Text style={{ color: colors.accent }}>MENTS</Text>
        </Text>
        <Text style={[styles.commentCount, { color: colors.textMuted }]}>
          {comments.length} replies
        </Text>
      </View>

      {/* Original post summary */}
      <View
        style={[
          styles.postSummary,
          { backgroundColor: colors.inputBg, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.postUser, { color: colors.accent }]}>
          {post.username}
        </Text>
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
          <CommentItem comment={item} depth={item.depth} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              NO COMMENTS
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              start the conversation
            </Text>
          </View>
        }
      />

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
          value={newComment}
          onChangeText={setNewComment}
          placeholder="drop a comment..."
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
          <Text
            style={[
              styles.sendText,
              {
                color: newComment.trim() ? '#FFF' : colors.textMuted,
              },
            ]}
          >
            ↑
          </Text>
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
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2.5,
  },
  backBtn: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.titleSize,
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
  postUser: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -0.3,
    marginBottom: 4,
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
  sendText: {
    fontSize: 20,
    fontWeight: '900',
  },
});

export default CommentsScreen;
