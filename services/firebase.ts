
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration for Firebase Project
// In a real environment, these would come from process.env.API_KEY etc.
const firebaseConfig = {
  apiKey: "AIzaSyBGODSrpboUMjJDjToTfa6fh_Q6z2N5cIs",
  authDomain: "campaign-flow-ngo.firebaseapp.com",
  projectId: "campaign-flow-ngo",
  storageBucket: "campaign-flow-ngo.firebasestorage.app",
  messagingSenderId: "281904555874",
  appId: "1:281904555874:web:76c63b73aaf8eac8366e3b",
  measurementId: "G-LFNNVBMX6M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
