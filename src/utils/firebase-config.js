import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA0hA8hk1LvRS3CmMibIeUy8K7qNFsUVTc",
  authDomain: "front-simulator.firebaseapp.com",
  projectId: "front-simulator",
  storageBucket: "front-simulator.firebasestorage.app",
  messagingSenderId: "322831450359",
  appId: "1:322831450359:web:f7b6d5b8aa8e4f3fe393f2",
  measurementId: "G-ZJ9TH7ZN11"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
