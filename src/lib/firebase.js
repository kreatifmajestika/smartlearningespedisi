// Import the functions you need from the SDKs you need
// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, set, get, remove, update } from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { encryptData } from "./encryption";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_MAIN_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_MAIN_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_MAIN_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_MAIN_PROJECT_ID,
  storageBucket: "learning-9bd1a.firebasestorage.app",
  messagingSenderId: "360334768996",
  appId: "1:360334768996:web:7b0a513ab9bff866b7d871",
  measurementId: "G-3C6HFWTLE6",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Fungsi untuk membuat user baru dengan password terenkripsi
const createUserWithPassword = async (email, password, userData) => {
  try {
    // 1. Buat user di Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // 2. Enkripsi password sebelum disimpan ke RTDB
    const encryptedPassword = encryptData(password);

    // 3. Simpan data user ke RTDB
    await set(ref(database, `users/${userCredential.user.uid}`), {
      ...userData,
      email,
      encryptedPassword, // Simpan password terenkripsi
      role: userData.role || "user",
      createdAt: new Date().toISOString(),
    });

    return userCredential.user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Fungsi untuk admin melihat password (dekripsi)
const getDecryptedPassword = async (userId) => {
  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return {
        email: userData.email,
        decryptedPassword: decryptData(userData.encryptedPassword),
      };
    }
    return null;
  } catch (error) {
    console.error("Error decrypting password:", error);
    throw error;
  }
};

// Fungsi update user (termasuk update password)
const updateUserPassword = async (userId, newPassword) => {
  try {
    const encryptedPassword = encryptData(newPassword);
    await update(ref(database, `users/${userId}`), {
      encryptedPassword,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

export {
  database,
  auth,
  createUserWithEmailAndPassword,
  createUserWithPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  getDecryptedPassword,
  updateUserPassword,
  ref,
  get,
  set,
  remove,
};
