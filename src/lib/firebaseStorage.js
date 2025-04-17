// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: NEXT_PUBLIC_STORAGE_API_KEY,
  authDomain: NEXT_PUBLIC_STORAGE_AUTH_DOMAIN,
  projectId: NEXT_PUBLIC_STORAGE_PROJECT_ID,
  storageBucket: NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: NEXT_PUBLIC_MAIN_MESSAGINGSENDERID,
  appId: "1:279533452715:web:d61b3f5571dd24b9dba6ee",
  measurementId: NEXT_PUBLIC_MAIN_MEASURENTID,
};

const app = initializeApp(firebaseConfig, "storageApp");
const storage = getStorage(app);

export { storage };
