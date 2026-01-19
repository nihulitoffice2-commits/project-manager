import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isSysAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let userUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // Clean up previous user listener if exists
      if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = null;
      }

      try {
        setError(null);
        if (fbUser) {
          const userDocRef = doc(db, 'users', fbUser.uid);
          
          // Start listening to the user document
          userUnsubscribe = onSnapshot(userDocRef, async (snapshot) => {
            if (snapshot.exists()) {
              setCurrentUser({ id: fbUser.uid, ...snapshot.data() } as User);
              setLoading(false);
            } else {
              // Create default user if doc doesn't exist
              const newUser: User = {
                id: fbUser.uid,
                name: fbUser.displayName || 'מנהל מערכת',
                email: fbUser.email || '',
                role: UserRole.SYS_ADMIN,
                accessibleProjects: [],
                photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'Admin')}&background=random`
              };
              await setDoc(userDocRef, newUser);
              // The snapshot listener will trigger again with the new data
            }
          }, (err) => {
            console.error("User doc listener error:", err);
            setError("שגיאה בטעינת נתוני משתמש.");
            setLoading(false);
          });
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Auth sync error:", err);
        setError("תקלה בתקשורת עם השרת.");
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (userUnsubscribe) userUnsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("שגיאת התחברות. וודא ש-Anonymous Auth מופעל ב-Firebase Console.");
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isSysAdmin = currentUser?.role === UserRole.SYS_ADMIN;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isSysAdmin, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
