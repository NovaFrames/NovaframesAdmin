// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwAKgbazi5GCdLC3R8UrgynTOk5jiSfC0",
  authDomain: "novaframes-c3ba5.firebaseapp.com",
  projectId: "novaframes-c3ba5",
  storageBucket: "novaframes-c3ba5.firebasestorage.app",
  messagingSenderId: "926210196445",
  appId: "1:926210196445:web:1bfc616f368cf71d2eec34",
  measurementId: "G-Z5SCZ6NV4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, getDocs, addDoc };