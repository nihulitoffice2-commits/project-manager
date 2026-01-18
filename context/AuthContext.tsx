
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isSysAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // In a real app, fetch user role/data from Firestore 'users' collection
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setCurrentUser({ id: fbUser.uid, ...userDoc.data() } as User);
        } else {
          // Fallback for demo
          setCurrentUser({
            id: fbUser.uid,
            name: fbUser.displayName || 'משתמש מערכת',
            email: fbUser.email || '',
            role: UserRole.SYS_ADMIN,
            accessibleProjects: [],
            photoURL: 'https://picsum.photos/200'
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    await signInAnonymously(auth);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isSysAdmin = currentUser?.role === UserRole.SYS_ADMIN;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isSysAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
