// ═══════════════════════════════════════════════════════════
//  Service Galerie Firebase (Firestore)
//  Centre Culturel Les Bambous
// ═══════════════════════════════════════════════════════════

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';

const COLLECTION = 'gallery';

// ─────────────────────────────────────────────────────────────────────────────
//  Fallback localStorage (si Firebase non configuré)
// ─────────────────────────────────────────────────────────────────────────────
const LOCAL_KEY = 'bambous_gallery_custom';

const loadLocalItems = () => {
    try {
        const s = localStorage.getItem(LOCAL_KEY);
        return s ? JSON.parse(s) : [];
    } catch { return []; }
};

const saveLocalItem = (item) => {
    const existing = loadLocalItems();
    const updated = [...existing, item];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
};

const deleteLocalItem = (itemId) => {
    const existing = loadLocalItems();
    const updated = existing.filter(i => String(i.id) !== String(itemId));
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
};

// ─────────────────────────────────────────────────────────────────────────────
//  Écouter la galerie en temps réel (onSnapshot)
//  Retourne la fonction de désabonnement (unsubscribe)
// ─────────────────────────────────────────────────────────────────────────────
export const subscribeToGallery = (onData, onError) => {
    if (!isConfigured || !db) {
        // Pas de Firebase → données locales
        onData({ items: loadLocalItems(), source: 'local' });
        return () => { };
    }

    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            onData({ items, source: 'firebase' });
        },
        (err) => {
            console.error('[GalleryService] Erreur temps réel :', err);
            if (onError) onError(err);
        }
    );

    return unsubscribe;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Ajouter un média dans la galerie
// ─────────────────────────────────────────────────────────────────────────────
export const addGalleryItem = async (itemData) => {
    const payload = {
        ...itemData,
        createdAt: isConfigured && db ? serverTimestamp() : Date.now(),
    };

    if (!isConfigured || !db) {
        const localItem = { ...payload, id: `local_${Date.now()}`, createdAt: Date.now() };
        saveLocalItem(localItem);
        return { success: true, item: localItem, source: 'local' };
    }

    try {
        const docRef = await addDoc(collection(db, COLLECTION), payload);
        return { success: true, id: docRef.id, source: 'firebase' };
    } catch (err) {
        console.error('[GalleryService] Erreur écriture Firestore :', err);
        // Fallback local si erreur réseau
        const localItem = { ...payload, id: `local_${Date.now()}`, createdAt: Date.now() };
        saveLocalItem(localItem);
        return { success: false, item: localItem, source: 'local', error: err.message };
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Supprimer un média (admin uniquement)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteGalleryItem = async (itemId) => {
    if (!isConfigured || !db) {
        deleteLocalItem(itemId);
        return { success: true, source: 'local' };
    }

    try {
        await deleteDoc(doc(db, COLLECTION, itemId));
        return { success: true, source: 'firebase' };
    } catch (err) {
        console.error('[GalleryService] Erreur suppression Firestore :', err);
        return { success: false, error: err.message };
    }
};

export { isConfigured };
