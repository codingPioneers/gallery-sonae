// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcjtK4zhj40vI9Z3SXjCYKeDYHGrrbcrA",
  authDomain: "sonae-gallery.firebaseapp.com",
  projectId: "sonae-gallery",
  storageBucket: "sonae-gallery.appspot.com",
  messagingSenderId: "51846747087",
  appId: "1:51846747087:web:a968821eca621d3bbcf8ba",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and export it
export const auth = getAuth(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);
