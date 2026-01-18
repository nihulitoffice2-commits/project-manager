
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        setError(null);
        if (fbUser) {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setCurrentUser({ id: fbUser.uid, ...userDoc.data() } as User);
          } else {
            // Create user document if it doesn't exist
            const newUser: User = {
              id: fbUser.uid,
              name: fbUser.displayName || 'מנהל מערכת',
              email: fbUser.email || '',
              role: UserRole.SYS_ADMIN,
              accessibleProjects: [],
              photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'Admin')}&background=random`
            };
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err: any) {
        console.error("Auth error:", err);
        setError(err.message || "תקלה בסנכרון המשתמש");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("לא ניתן להתחבר אנונימית. ודא ש-Anonymous Auth מופעל ב-Firebase.");
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
