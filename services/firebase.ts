
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBGODSrpboUMjJDjToTfa6fh_Q6z2N5cIs",
  authDomain: "campaign-flow-ngo.firebaseapp.com",
  projectId: "campaign-flow-ngo",
  storageBucket: "campaign-flow-ngo.firebasestorage.app",
  messagingSenderId: "281904555874",
  appId: "1:281904555874:web:76c63b73aaf8eac8366e3b",
  measurementId: "G-LFNNVBMX6M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("Firebase initialized successfully with campaign-flow-ngo project.");
