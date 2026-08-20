// ═══════════════════════════════════════════════════════════
//  Firebase Configuration — Centre Culturel Les Bambous
// ═══════════════════════════════════════════════════════════
//  Les valeurs sont lues depuis les variables d'environnement
//  définies dans le fichier .env (ne jamais committer les clés !)
// ═══════════════════════════════════════════════════════════

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialiser Firebase uniquement si la config est présente
const isConfigured = Object.values(firebaseConfig).every(Boolean);

let app = null;
let db = null;

if (isConfigured) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} else {
    console.warn(
        '[Firebase] Configuration manquante. Ajoutez vos clés Firebase dans le fichier .env.\n' +
        'Mode hors-ligne activé : les événements seront sauvegardés localement.'
    );
}

export { db, isConfigured };
