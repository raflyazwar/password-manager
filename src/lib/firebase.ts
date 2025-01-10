import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAbGIx0s0jWd6s2L1L0X6yXnkP6nsYZQPs",
  authDomain: "password-manager-b7465.firebaseapp.com",
  projectId: "password-manager-b7465",
  storageBucket: "password-manager-b7465.firebasestorage.app",
  messagingSenderId: "26134438250",
  appId: "1:26134438250:web:9b8592eb39d7fda4184513",
  measurementId: "G-C4M4DMK4WV"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);