// config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Твій Firebase конфіг з Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyOtXetPGzSamE0FnEM438pINucavpVpvGw",
  authDomain: "riseup-f3afa.firebaseapp.com",
  projectId: "riseup-f3afa",
  storageBucket: "riseup-f3afa.firebasestorage.app",
  messagingSenderId: "922263657741",
  appId: "1:922263657741:web:b43ff253b81c3d19196444",
  measurementId: "G-NOX1GXD3P5"
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);

// Ініціалізація Firestore
export const db = getFirestore(app);

// Колекції
export const COLLECTIONS = {
  HABITS: 'habits',
  USERS: 'users', 
  PROGRESS: 'progress'
};

console.log('🔥 Firebase підключено успішно!');