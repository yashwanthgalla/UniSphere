import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
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
    const { setDoc } = await import('firebase/firestore');
    return setDoc(doc(db, 'users', userId), {
      ...data,
      karma: 0,
      joinedCommunities: [],
      createdAt: serverTimestamp(),
    });
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
