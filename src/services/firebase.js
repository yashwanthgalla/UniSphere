// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBNQwP8FiXud6Y7YBkviDnaymRFyguq2SU',
  authDomain: 'unisphere-f1eb3.firebaseapp.com',
  projectId: 'unisphere-f1eb3',
  storageBucket: 'unisphere-f1eb3.appspot.com',
  messagingSenderId: '696060481784',
  appId: '1:696060481784:web:30f9713f889d0d03a6eb0d',
  measurementId: 'G-8YRHWSQHK1',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use persistent auth for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
