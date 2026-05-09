import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCL12b0vMA1H1y5satg0Ehbwvdr4p7aVW4",
  authDomain: "ore-no-qr.firebaseapp.com",
  projectId: "ore-no-qr",
  storageBucket: "ore-no-qr.firebasestorage.app",
  messagingSenderId: "1029394626799",
  appId: "1:1029394626799:web:9837a2a15c017aa0d9031a",
  measurementId: "G-KQEMHCW576"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
