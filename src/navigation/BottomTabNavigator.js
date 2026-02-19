import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';

import HomeFeedScreen from '../screens/HomeFeedScreen';
import CommunitiesScreen from '../screens/CommunitiesScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, icon, focused, color }) => (
  <View style={styles.tabItem}>
    <Text style={[styles.tabIcon, { color }]}>{icon}</Text>
    {focused && (
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    )}
  </View>
);

const BottomTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 2.5,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeFeedScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="HOME" icon="◉" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Communities"
        component={CommunitiesScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="HUBS" icon="⬡" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.createBtn,
                {
                  backgroundColor: colors.accent,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.createIcon}>+</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="ALERTS" icon="◈" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon label="ME" icon="◧" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    fontWeight: '900',
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  createIcon: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: -2,
  },
});

export default BottomTabNavigator;
