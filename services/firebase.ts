
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration for Firebase Project
// In a real environment, these would come from process.env.API_KEY etc.
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "campaign-flow-ngo.firebaseapp.com",
  projectId: "campaign-flow-ngo",
  storageBucket: "campaign-flow-ngo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
