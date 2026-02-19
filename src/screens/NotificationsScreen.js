import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { formatTimestamp } from '../utils/helpers';

const ICON_MAP = {
  like: '▲',
  comment: '💬',
  reply: '↩',
};

const COLOR_MAP = {
  like: '#FF4500',
  comment: '#1A1AFF',
  reply: '#00E676',
};

const NotificationItem = ({ item, colors }) => (
  <View
    style={[
      styles.notifCard,
      {
        backgroundColor: item.read ? colors.card : colors.inputBg,
        borderColor: colors.border,
      },
    ]}
  >
    <View
      style={[
        styles.notifIcon,
        {
          backgroundColor: COLOR_MAP[item.type] || colors.accent,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={styles.notifIconText}>{ICON_MAP[item.type] || '●'}</Text>
    </View>
    <View style={styles.notifContent}>
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
  </View>
);

const NotificationsScreen = () => {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderItem = useCallback(
    ({ item }) => <NotificationItem item={item} colors={colors} />,
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

      {/* List */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
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
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifIconText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  notifContent: {
    flex: 1,
    marginLeft: SPACING.sm,
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
