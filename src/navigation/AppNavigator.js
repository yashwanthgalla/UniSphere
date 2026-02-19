import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import CommunityFeedScreen from '../screens/CommunityFeedScreen';
import CreateCommunityScreen from '../screens/CreateCommunityScreen';
import CommentsScreen from '../screens/CommentsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import UserSearchScreen from '../screens/UserSearchScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ConfessionWallScreen from '../screens/ConfessionWallScreen';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
    <Stack.Screen name="CreateCommunity" component={CreateCommunityScreen} />
    <Stack.Screen name="Comments" component={CommentsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="UserSearch" component={UserSearchScreen} />
    <Stack.Screen name="ConfessionWall" component={ConfessionWallScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
