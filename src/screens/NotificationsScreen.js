import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/firestore';
import { formatTimestamp } from '../utils/helpers';

const ICON_MAP = {
  like: 'arrow-up-circle',
  upvote: 'arrow-up-circle',
  comment: 'chatbubble',
  reply: 'return-down-forward',
  follow: 'person-add',
  mention: 'at',
  community: 'people',
};

const COLOR_MAP = {
  like: '#FF4500',
  upvote: '#FF4500',
  comment: '#1A1AFF',
  reply: '#00E676',
  follow: '#FFD600',
  mention: '#7C4DFF',
  community: '#FF6B9D',
};

const NotificationItem = ({ item, colors, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={() => onPress?.(item)}
    style={[
      styles.notifCard,
      {
        backgroundColor: item.read ? colors.card : colors.inputBg,
        borderColor: item.read ? colors.border : colors.accent,
      },
    ]}
  >
    <View
      style={[
        styles.notifIcon,
        {
          backgroundColor: COLOR_MAP[item.type] || colors.accent,
        },
      ]}
    >
      <Ionicons
        name={ICON_MAP[item.type] || 'notifications'}
        size={18}
        color="#FFF"
      />
    </View>
    <View style={styles.notifContent}>
      {item.fromUsername && (
        <Text style={[styles.notifFrom, { color: colors.accent }]}>
          {item.fromUsername}
        </Text>
      )}
      <Text style={[styles.notifText, { color: colors.text }]}>
        {item.text}
      </Text>
      <Text style={[styles.notifTime, { color: colors.textMuted }]}>
        {formatTimestamp(item.createdAt)}
      </Text>
    </View>
    {!item.read && (
      <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
    )}
  </TouchableOpacity>
);

const NotificationsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotifPress = async (item) => {
    // Mark as read
    if (!item.read) {
      try { await notificationService.markRead(item.id); } catch (e) {}
    }
    if (item.type === 'follow' && item.fromUserId) {
      navigation.navigate('UserProfile', { userId: item.fromUserId });
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationService.markAllRead(user?.uid);
    } catch (e) {
      Alert.alert('Error', 'Could not mark all as read.');
    }
  };

  const renderItem = useCallback(
    ({ item }) => <NotificationItem item={item} colors={colors} onPress={handleNotifPress} />,
    [colors]
  );

  // Listen to Firestore notifications for this user
  useFocusEffect(
    React.useCallback(() => {
      if (!user?.uid) return;
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNotifications(notifData);
      });
      return () => unsubscribe();
    }, [user?.uid])
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
            stay updated
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            NOTI
            <Text style={{ color: colors.accent }}>FICATIONS</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={[styles.markAllBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Ionicons name="checkmark-done" size={16} color={colors.accent} />
              <Text style={[styles.markAllText, { color: colors.accent }]}>ALL READ</Text>
            </TouchableOpacity>
          )}
          {unreadCount > 0 && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.accent,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={56} color={colors.textMuted} style={{ opacity: 0.3, marginBottom: SPACING.md }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              ALL CLEAR
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              no notifications yet
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    gap: 4,
  },
  markAllText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 0.5,
  },
  badge: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  notifFrom: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  notifText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.semiBold,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: SPACING.sm,
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

export default NotificationsScreen;
