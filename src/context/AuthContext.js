import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsVerified(true); // In production, check Firestore for verification status
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return authService.signIn(email, password);
  };

  const signup = async (email, password, university, username) => {
    return authService.signUp(email, password, university, username);
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setIsVerified(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isVerified, setIsVerified, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
