import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Posts ────────────────────────────────────────
export const postService = {
  create: async (postData) => {
    return addDoc(collection(db, 'posts'), {
      ...postData,
      likes: 0,
      commentCount: 0,
      likedBy: [],
      createdAt: serverTimestamp(),
    });
  },

  getFeed: async (lastDoc = null, pageSize = 10) => {
    let q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    const snapshot = await getDocs(q);
    return {
      posts: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
    };
  },

  getByCommunity: async (communityId, lastDoc = null, pageSize = 10) => {
    let q = query(
      collection(db, 'posts'),
      where('communityId', '==', communityId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    const snapshot = await getDocs(q);
    return {
      posts: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
    };
  },

  getByUser: async (userId) => {
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  like: async (postId, userId) => {
    const ref = doc(db, 'posts', postId);
    return updateDoc(ref, {
      likes: increment(1),
      likedBy: arrayUnion(userId),
    });
  },

  unlike: async (postId, userId) => {
    const ref = doc(db, 'posts', postId);
    return updateDoc(ref, {
      likes: increment(-1),
      likedBy: arrayRemove(userId),
    });
  },

  // ─── Upvote / Downvote System ──────────────────
  upvote: async (postId, userId, wasDown = false) => {
    const ref = doc(db, 'posts', postId);
    const updates = {
      upvotes: increment(1),
      upvotedBy: arrayUnion(userId),
    };
    if (wasDown) {
      updates.downvotes = increment(-1);
      updates.downvotedBy = arrayRemove(userId);
    }
    return updateDoc(ref, updates);
  },

  removeUpvote: async (postId, userId) => {
    const ref = doc(db, 'posts', postId);
    return updateDoc(ref, {
      upvotes: increment(-1),
      upvotedBy: arrayRemove(userId),
    });
  },

  downvote: async (postId, userId, wasUp = false) => {
    const ref = doc(db, 'posts', postId);
    const updates = {
      downvotes: increment(1),
      downvotedBy: arrayUnion(userId),
    };
    if (wasUp) {
      updates.upvotes = increment(-1);
      updates.upvotedBy = arrayRemove(userId);
    }
    return updateDoc(ref, updates);
  },

  removeDownvote: async (postId, userId) => {
    const ref = doc(db, 'posts', postId);
    return updateDoc(ref, {
      downvotes: increment(-1),
      downvotedBy: arrayRemove(userId),
    });
  },

  // ─── Bookmark System ───────────────────────────
  bookmark: async (postId, userId) => {
    const postRef = doc(db, 'posts', postId);
    const userRef = doc(db, 'users', userId);
    await updateDoc(postRef, { bookmarkedBy: arrayUnion(userId) });
    return updateDoc(userRef, { bookmarks: arrayUnion(postId) });
  },

  unbookmark: async (postId, userId) => {
    const postRef = doc(db, 'posts', postId);
    const userRef = doc(db, 'users', userId);
    await updateDoc(postRef, { bookmarkedBy: arrayRemove(userId) });
    return updateDoc(userRef, { bookmarks: arrayRemove(postId) });
  },

  // ─── Poll Voting ──────────────────────────────
  votePoll: async (postId, userId, optionIndex) => {
    const postRef = doc(db, 'posts', postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const pollOptions = data.pollOptions || [];
    if (optionIndex < 0 || optionIndex >= pollOptions.length) return;
    // Check if user already voted
    const votedBy = data.pollVotedBy || {};
    if (votedBy[userId] !== undefined) return;
    // Increment the chosen option's votes
    pollOptions[optionIndex] = {
      ...pollOptions[optionIndex],
      votes: (pollOptions[optionIndex].votes || 0) + 1,
    };
    return updateDoc(postRef, {
      pollOptions,
      [`pollVotedBy.${userId}`]: optionIndex,
    });
  },

  delete: async (postId) => deleteDoc(doc(db, 'posts', postId)),
};

// ─── Comments ─────────────────────────────────────
export const commentService = {
  getByPost: async (postId) => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  add: async (postId, commentData) => {
    const ref = doc(db, 'posts', postId);
    await updateDoc(ref, { commentCount: increment(1) });
    return addDoc(collection(db, 'posts', postId, 'comments'), {
      ...commentData,
      createdAt: serverTimestamp(),
    });
  },

  listenToComments: (postId, callback) => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  },
};

// ─── Communities ──────────────────────────────────
export const communityService = {
  create: async (data) => {
    return addDoc(collection(db, 'communities'), {
      ...data,
      memberCount: 1,
      createdAt: serverTimestamp(),
    });
  },

  getAll: async () => {
    const snapshot = await getDocs(collection(db, 'communities'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  getById: async (id) => {
    const snap = await getDoc(doc(db, 'communities', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  join: async (communityId, userId) => {
    return updateDoc(doc(db, 'communities', communityId), {
      members: arrayUnion(userId),
      memberCount: increment(1),
    });
  },

  leave: async (communityId, userId) => {
    return updateDoc(doc(db, 'communities', communityId), {
      members: arrayRemove(userId),
      memberCount: increment(-1),
    });
  },

  listenAll: (callback) => {
    const q = query(collection(db, 'communities'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const communities = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(communities);
    });
  },

  listenOne: (communityId, callback) => {
    return onSnapshot(doc(db, 'communities', communityId), (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      }
    });
  },
};

// ─── Users / Profile ─────────────────────────────
export const userService = {
  getProfile: async (userId) => {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  updateProfile: async (userId, data) => {
    return updateDoc(doc(db, 'users', userId), data);
  },

  createProfile: async (userId, data) => {
    return setDoc(doc(db, 'users', userId), {
      ...data,
      karma: 0,
      joinedCommunities: [],
      followers: [],
      following: [],
      blockedUsers: [],
      bio: '',
      avatar: null,
      createdAt: serverTimestamp(),
    });
  },

  // Search users by username (prefix match)
  searchUsers: async (searchText, currentUserId) => {
    const q = query(
      collection(db, 'users'),
      where('username', '>=', searchText.toLowerCase()),
      where('username', '<=', searchText.toLowerCase() + '\uf8ff'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.id !== currentUserId);
  },

  // Listen to user profile changes in real-time
  listenToProfile: (userId, callback) => {
    return onSnapshot(doc(db, 'users', userId), (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      }
    });
  },
};

// ─── Follow / Unfollow / Block System ─────────────
export const socialService = {
  // Follow a user
  follow: async (currentUserId, targetUserId) => {
    // Add to current user's following list
    await updateDoc(doc(db, 'users', currentUserId), {
      following: arrayUnion(targetUserId),
    });
    // Add to target user's followers list
    await updateDoc(doc(db, 'users', targetUserId), {
      followers: arrayUnion(currentUserId),
    });
    // Create a follow notification
    await addDoc(collection(db, 'notifications'), {
      userId: targetUserId,
      type: 'follow',
      text: 'started following you',
      fromUserId: currentUserId,
      read: false,
      createdAt: serverTimestamp(),
    });
  },

  // Unfollow a user
  unfollow: async (currentUserId, targetUserId) => {
    await updateDoc(doc(db, 'users', currentUserId), {
      following: arrayRemove(targetUserId),
    });
    await updateDoc(doc(db, 'users', targetUserId), {
      followers: arrayRemove(currentUserId),
    });
  },

  // Block a user
  block: async (currentUserId, targetUserId) => {
    // Block the user
    await updateDoc(doc(db, 'users', currentUserId), {
      blockedUsers: arrayUnion(targetUserId),
    });
    // Also unfollow each other
    await updateDoc(doc(db, 'users', currentUserId), {
      following: arrayRemove(targetUserId),
      followers: arrayRemove(targetUserId),
    });
    await updateDoc(doc(db, 'users', targetUserId), {
      following: arrayRemove(currentUserId),
      followers: arrayRemove(currentUserId),
    });
  },

  // Unblock a user
  unblock: async (currentUserId, targetUserId) => {
    await updateDoc(doc(db, 'users', currentUserId), {
      blockedUsers: arrayRemove(targetUserId),
    });
  },

  // Check relationship status between two users
  getRelationship: async (currentUserId, targetUserId) => {
    const currentProfile = await getDoc(doc(db, 'users', currentUserId));
    const currentData = currentProfile.data() || {};
    const isFollowing = (currentData.following || []).includes(targetUserId);
    const isFollower = (currentData.followers || []).includes(targetUserId);
    const isBlocked = (currentData.blockedUsers || []).includes(targetUserId);
    return { isFollowing, isFollower, isBlocked };
  },

  // Get followers list
  getFollowers: async (userId) => {
    const profile = await getDoc(doc(db, 'users', userId));
    const data = profile.data() || {};
    const followerIds = data.followers || [];
    if (followerIds.length === 0) return [];
    const users = [];
    for (const id of followerIds) {
      const snap = await getDoc(doc(db, 'users', id));
      if (snap.exists()) users.push({ id: snap.id, ...snap.data() });
    }
    return users;
  },

  // Get following list
  getFollowing: async (userId) => {
    const profile = await getDoc(doc(db, 'users', userId));
    const data = profile.data() || {};
    const followingIds = data.following || [];
    if (followingIds.length === 0) return [];
    const users = [];
    for (const id of followingIds) {
      const snap = await getDoc(doc(db, 'users', id));
      if (snap.exists()) users.push({ id: snap.id, ...snap.data() });
    }
    return users;
  },
};

// ─── Notifications ────────────────────────────────
export const notificationService = {
  getByUser: async (userId) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  markRead: async (notifId) => {
    return updateDoc(doc(db, 'notifications', notifId), { read: true });
  },

  markAllRead: async (userId) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map((d) =>
      updateDoc(doc(db, 'notifications', d.id), { read: true })
    );
    return Promise.all(updates);
  },

  listenToNotifications: (userId, callback) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  },
};

// ─── Chat / Messaging ────────────────────────────
export const chatService = {
  // Search users by username
  searchUsers: async (searchText, currentUserId) => {
    const q = query(
      collection(db, 'users'),
      where('username', '>=', searchText.toLowerCase()),
      where('username', '<=', searchText.toLowerCase() + '\uf8ff'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => u.id !== currentUserId);
  },

  // Get or create a 1-on-1 conversation between two users
  getOrCreateConversation: async (userId1, userId2, user1Data, user2Data) => {
    if (!userId1 || !userId2) {
      throw new Error('Both user IDs are required to create a conversation');
    }
    const participants = [userId1, userId2].sort();

    // Try to find existing conversation
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participantIds', '==', participants)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }
    } catch (e) {
      console.warn('Conversation lookup failed, creating new:', e.message);
    }

    const convoRef = await addDoc(collection(db, 'conversations'), {
      participantIds: participants,
      participantDetails: [
        { uid: user1Data.uid, username: user1Data.username, avatar: user1Data.avatar || null },
        { uid: user2Data.uid, username: user2Data.username, avatar: user2Data.avatar || null },
      ],
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      unreadCount: { [userId1]: 0, [userId2]: 0 },
    });

    return convoRef.id;
  },

  // Listen to all conversations for a user (real-time)
  listenToConversations: (userId, callback) => {
    // Use a simple collection listener and filter client-side
    // This handles both old docs (without participantIds) and new ones
    return onSnapshot(collection(db, 'conversations'), (snapshot) => {
      const convos = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => {
          // Check participantIds array
          if (Array.isArray(c.participantIds) && c.participantIds.includes(userId)) {
            return true;
          }
          // Fallback: check participantDetails array
          if (Array.isArray(c.participantDetails)) {
            return c.participantDetails.some((p) => p.uid === userId);
          }
          return false;
        });

      // Sort by lastMessageAt descending
      convos.sort((a, b) => {
        const aTime = a.lastMessageAt?.toMillis?.() || a.lastMessageAt?.seconds || 0;
        const bTime = b.lastMessageAt?.toMillis?.() || b.lastMessageAt?.seconds || 0;
        return bTime - aTime;
      });

      callback(convos);

      // Patch old docs that are missing participantIds
      convos.forEach((c) => {
        if (!Array.isArray(c.participantIds) && Array.isArray(c.participantDetails)) {
          const ids = c.participantDetails.map((p) => p.uid).filter(Boolean).sort();
          if (ids.length > 0) {
            updateDoc(doc(db, 'conversations', c.id), { participantIds: ids }).catch(() => {});
          }
        }
      });
    }, (error) => {
      console.error('listenToConversations error:', error.message);
      callback([]);
    });
  },

  // Send a message in a conversation
  sendMessage: async (conversationId, messageData) => {
    if (!conversationId || typeof conversationId !== 'string') {
      console.warn('sendMessage: invalid conversationId', conversationId);
      return;
    }
    console.log('sendMessage: sending to', conversationId);

    try {
      const msgRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        ...messageData,
        createdAt: serverTimestamp(),
        read: false,
      });
      console.log('sendMessage: message saved with id', msgRef.id);
    } catch (e) {
      console.error('sendMessage addDoc failed:', e);
      throw e;
    }

    try {
      const convoSnap = await getDoc(doc(db, 'conversations', conversationId));
      if (convoSnap.exists()) {
        const convoData = convoSnap.data();
        const participantIds = convoData?.participantIds || [];
        const otherUserId = participantIds.find((id) => id !== messageData.senderId);
        const updates = {
          lastMessage: messageData.text,
          lastMessageAt: serverTimestamp(),
        };
        if (otherUserId) {
          updates[`unreadCount.${otherUserId}`] = increment(1);
        }
        await updateDoc(doc(db, 'conversations', conversationId), updates);
      }
    } catch (e) {
      console.warn('sendMessage metadata update failed:', e.message);
    }
  },

  // Listen to messages in a conversation (real-time)
  listenToMessages: (conversationId, callback) => {
    if (!conversationId || typeof conversationId !== 'string') {
      console.warn('listenToMessages: invalid conversationId', conversationId);
      callback([]);
      return () => {};
    }
    // Listen to all messages and sort client-side for maximum compatibility
    return onSnapshot(
      collection(db, 'conversations', conversationId, 'messages'),
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        msgs.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
          return aTime - bTime;
        });
        callback(msgs);
      },
      (error) => {
        console.error('listenToMessages error:', error.message);
        callback([]);
      }
    );
  },

  // Mark conversation as read for a user
  markConversationRead: async (conversationId, userId) => {
    if (!conversationId || typeof conversationId !== 'string') return;
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`unreadCount.${userId}`]: 0,
      });
    } catch (e) {
      console.warn('markConversationRead failed:', e.message);
    }
  },
};
