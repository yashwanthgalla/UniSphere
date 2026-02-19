import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuth,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export const authService = {
  signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),

  signUp: async (email, password, university, username) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Store user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      university,
      username,
      createdAt: new Date(),
    });
    // Send verification email
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    return userCredential;
  },

  signOut: () => firebaseSignOut(auth),

  onAuthStateChanged: (callback) => firebaseOnAuth(auth, callback),

  getCurrentUser: () => auth.currentUser,
};
