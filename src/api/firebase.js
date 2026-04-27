// Imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBc6eroX5EuCLpWJbGmsUycFQx8FH-swiE",
  authDomain: "wakely-db.firebaseapp.com",
  projectId: "wakely-db",
  storageBucket: "wakely-db.firebasestorage.app",
  messagingSenderId: "779261240441",
  appId: "1:779261240441:web:5e5640403a779f4f9460a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);