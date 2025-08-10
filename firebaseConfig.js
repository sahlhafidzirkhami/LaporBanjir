// Import fungsi yang dibutuhkan dari Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Ganti dengan konfigurasi Firebase Anda dari Notepad
const firebaseConfig = {
  apiKey: "AIzaSyDtFJXLuJdPJPu9Ozevaqmv1YH9NoC5K0c",
  authDomain: "banjir-2e906.firebaseapp.com",
  projectId: "banjir-2e906",
  storageBucket: "banjir-2e906.firebasestorage.app",
  messagingSenderId: "755571029020",
  appId: "1:755571029020:web:0ee730a7e23d173a195bd9",
  measurementId: "G-0C0TFGW3RT",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firestore Database dan ekspor untuk digunakan di file lain
const db = getFirestore(app);

export { app, db };
