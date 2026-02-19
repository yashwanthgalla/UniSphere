import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../theme';

import HomeFeedScreen from '../screens/HomeFeedScreen';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatListScreen from '../screens/ChatListScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', component: HomeFeedScreen, icon: 'home', iconOutline: 'home-outline', label: 'HOME' },
  { name: 'Communities', component: CommunitiesScreen, icon: 'people', iconOutline: 'people-outline', label: 'HUBS' },
  { name: 'CreatePostPlaceholder', component: View, icon: 'add', iconOutline: 'add', label: 'POST' },
  { name: 'Chat', component: ChatListScreen, icon: 'chatbubbles', iconOutline: 'chatbubbles-outline', label: 'DMs' },
  { name: 'Profile', component: ProfileScreen, icon: 'person', iconOutline: 'person-outline', label: 'ME' },
];

const AnimatedTabIcon = ({ focused, color, iconName, iconOutline, label }) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(focused ? -2 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1 : 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: focused ? -2 : 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const dotScale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[styles.tabItem, { transform: [{ translateY }] }]}>
      <Ionicons
        name={focused ? iconName : iconOutline}
        size={focused ? 25 : 23}
        color={color}
      />
      {focused && (
        <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>{label}</Text>
      )}
      <Animated.View
        style={[
          styles.tabDot,
          {
            backgroundColor: color,
            transform: [{ scale: dotScale }],
            opacity: scaleAnim,
          },
        ]}
      />
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation, colors }) => {
  const mainNavigation = useNavigation();
  const fabScale = useRef(new Animated.Value(1)).current;

  const handleFabPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
    ]).start();
    mainNavigation.navigate('CreatePost');
  };

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: colors.tabBar }]}>
      {/* Top accent line */}
      <View style={[styles.tabBarTopLine, { backgroundColor: colors.border }]} />

      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tabConfig = TABS[index];

          // Center FAB button
          if (tabConfig.name === 'CreatePostPlaceholder') {
            return (
              <View key={route.key} style={styles.fabWrapper}>
                <Animated.View style={{ transform: [{ scale: fabScale }] }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleFabPress}
                    style={[
                      styles.fab,
                      {
                        backgroundColor: colors.accent,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Ionicons name="add" size={28} color="#FFF" />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            );
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabButton}
            >
              <AnimatedTabIcon
                focused={isFocused}
                color={isFocused ? colors.accent : colors.textMuted}
                iconName={tabConfig.icon}
                iconOutline={tabConfig.iconOutline}
                label={tabConfig.label}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom safe area fill */}
      <View style={[styles.bottomSafe, { backgroundColor: colors.tabBar }]} />
    </View>
  );
};

const BottomTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} colors={colors} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={
            tab.name === 'CreatePostPlaceholder'
              ? { tabBarButton: () => null }
              : undefined
          }
          listeners={
            tab.name === 'CreatePostPlaceholder'
              ? { tabPress: (e) => e.preventDefault() }
              : undefined
          }
        />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'relative',
  },
  tabBarTopLine: {
    height: 2.5,
    width: '100%',
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 62,
    paddingHorizontal: SPACING.xs,
  },
  bottomSafe: {
    height: Platform.OS === 'ios' ? 20 : 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 1,
    textTransform: 'uppercase',
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  fabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
});

export default BottomTabNavigator;
