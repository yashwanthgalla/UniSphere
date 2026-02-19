import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import CommunityFeedScreen from '../screens/CommunityFeedScreen';
import CreateCommunityScreen from '../screens/CreateCommunityScreen';
import CommentsScreen from '../screens/CommentsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
    <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
    <Stack.Screen name="CreateCommunity" component={CreateCommunityScreen} />
    <Stack.Screen name="Comments" component={CommentsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
