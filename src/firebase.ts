import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmo5GfitMtwH9sqH190meLv7eZaKxIr9M",
  authDomain: "sigap-apps-v3-driver.firebaseapp.com",
  projectId: "sigap-apps-v3-driver",
  storageBucket: "sigap-apps-v3-driver.firebasestorage.app",
  messagingSenderId: "1059694642293",
  appId: "1:1059694642293:web:734c685a97be39349b243c",
  measurementId: "G-NGEKBF717S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
