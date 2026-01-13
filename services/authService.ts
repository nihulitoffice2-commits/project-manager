
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { auth, firestore } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../types';

export const AuthService = {
  /**
   * Initializes Auth persistence to 30 days (local storage)
   */
  init: async () => {
    await setPersistence(auth, browserLocalPersistence);
  },

  /**
   * Email/Password Login
   */
  loginWithEmail: (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  },

  /**
   * Google OAuth Login
   */
  loginWithGoogle: () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },

  /**
   * Sign Out
   */
  logout: () => {
    return signOut(auth);
  },

  /**
   * Fetches the user profile and orgId from Firestore
   */
  getCurrentUserData: async (uid: string): Promise<User | null> => {
    const userDoc = await getDoc(doc(firestore, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return { 
        id: uid, 
        orgId: data.orgId,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar 
      } as User;
    }
    return null;
  },

  /**
   * Listens to auth state changes
   */
  onAuthChange: (callback: (user: any) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};
