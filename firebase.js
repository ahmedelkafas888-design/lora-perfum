import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration (your project)
const firebaseConfig = {
    apiKey: "AIzaSyCM_7_nTNaz7f9-j-zMZJcdGY6SZkEMvmc",
    authDomain: "lora-perfum.firebaseapp.com",
    projectId: "lora-perfum",
    storageBucket: "lora-perfum.firebasestorage.app",
    messagingSenderId: "612778500661",
    appId: "1:612778500661:web:d84d7f30023ae0ba42c77c",
    measurementId: "G-N043M0YRX7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Database Engine
const dbEngine = {
    async getCollection(collectionName) {
        const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getDocument(collectionName, docId) {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    },

    async createDocument(collectionName, data) {
        const payload = { ...data, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, collectionName), payload);
        return docRef.id;
    },

    async updateDocument(collectionName, docId, data) {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
        return true;
    },

    async deleteDocument(collectionName, docId) {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return true;
    }
};

export { db, dbEngine };
