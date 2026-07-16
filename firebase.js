// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { 
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    collection,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    writeBatch
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
const auth = getAuth(app);


export {
    db,
    auth,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    collection,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    writeBatch,
    onAuthStateChanged
};