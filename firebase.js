// Firebase Web SDK Modules initialized for the LORA Perfume Store Core Datastore Engine
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Protected explicitly supplied configuration credentials for the 'lora-perfum' project instance
const firebaseConfig = {
  apiKey: "AIzaSyCM_7_nTNaz7f9-j-zMZJcdGY6SZkEMvmc",
  authDomain: "lora-perfum.firebaseapp.com",
  projectId: "lora-perfum",
  storageBucket: "lora-perfum.firebasestorage.app",
  messagingSenderId: "612778500661",
  appId: "1:612778500661:web:d84d7f30023ae0ba42c77c",
  measurementId: "G-N043M0YRX7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global operational database services abstraction layers
const firestoreService = {
    async fetchCollection(collName) {
        try {
            const ref = collection(db, collName);
            const snapshot = await getDocs(ref);
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error(`Firestore fetch failure on collection ${collName}:`, error);
            throw error;
        }
    },

    async fetchDocument(collName, docId) {
        try {
            const ref = doc(db, collName, docId);
            const snapshot = await getDoc(ref);
            return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        } catch (error) {
            console.error(`Firestore document read exception on ${collName}/${docId}:`, error);
            throw error;
        }
    },

    async createDocument(collName, data) {
        try {
            const ref = collection(db, collName);
            const res = await addDoc(ref, { ...data, timestamp: Date.now() });
            return res.id;
        } catch (error) {
            console.error(`Firestore write insert transaction failed on ${collName}:`, error);
            throw error;
        }
    },

    async setDocumentExplicit(collName, docId, data) {
        try {
            const ref = doc(db, collName, docId);
            await setDoc(ref, data, { merge: true });
            return true;
        } catch (error) {
            console.error(`Firestore document explicit update failed on ${collName}/${docId}:`, error);
            throw error;
        }
    },

    async updateDocument(collName, docId, data) {
        try {
            const ref = doc(db, collName, docId);
            await updateDoc(ref, data);
            return true;
        } catch (error) {
            console.error(`Firestore modification write layer failure on ${collName}/${docId}:`, error);
            throw error;
        }
    },

    async deleteDocument(collName, docId) {
        try {
            const ref = doc(db, collName, docId);
            await deleteDoc(ref);
            return true;
        } catch (error) {
            console.error(`Firestore hard drop erase statement failure on ${collName}/${docId}:`, error);
            throw error;
        }
    }
};

export { db, firestoreService };
