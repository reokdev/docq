import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDKTK3hpRaN3h04Rezz7Pg7KxT2yCtRWpw",
    authDomain: "docq-84e7b.firebaseapp.com",
    projectId: "docq-84e7b",
    storageBucket: "docq-84e7b.firebasestorage.app",
    messagingSenderId: "912385558356",
    appId: "1:912385558356:web:99debcc1438df6a11e2ac1",
    measurementId: "G-8Y04NDJPY3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };