// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBvH4Pk8haPo8QCehMmitqNT0QD0pU5kD0",
    authDomain: "kpss-781ac.firebaseapp.com",
    projectId: "kpss-781ac",
    storageBucket: "kpss-781ac.firebasestorage.app",
    messagingSenderId: "1034711277352",
    appId: "1:1034711277352:web:62274511875a7bbbfcba1d"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db, doc, getDoc, setDoc, onSnapshot };