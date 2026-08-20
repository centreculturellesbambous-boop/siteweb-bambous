// ═══════════════════════════════════════════════════════════
//  Service Événements Firebase (Firestore)
//  Centre Culturel Les Bambous
// ═══════════════════════════════════════════════════════════

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';

const COLLECTION = 'events';

// ─────────────────────────────────────────────────────────────────────────────
//  Fallback localStorage (si Firebase non configuré)
// ─────────────────────────────────────────────────────────────────────────────
const LOCAL_KEY = 'bambous_events_local';

const loadLocalEvents = () => {
    try {
        const s = localStorage.getItem(LOCAL_KEY);
        return s ? JSON.parse(s) : [];
    } catch { return []; }
};

const saveLocalEvent = (event) => {
    const existing = loadLocalEvents();
    const updated = [...existing, event];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
};

// ─────────────────────────────────────────────────────────────────────────────
//  Récupérer tous les événements (one-shot)
// ─────────────────────────────────────────────────────────────────────────────
export const fetchEvents = async () => {
    if (!isConfigured || !db) {
        return { events: loadLocalEvents(), source: 'local' };
    }

    try {
        const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        return { events, source: 'firebase' };
    } catch (err) {
        console.error('[EventsService] Erreur lecture Firestore :', err);
        return { events: loadLocalEvents(), source: 'local', error: err.message };
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Écouter les événements en temps réel (onSnapshot)
//  Retourne la fonction de désabonnement (unsubscribe)
// ─────────────────────────────────────────────────────────────────────────────
export const subscribeToEvents = (onData, onError) => {
    if (!isConfigured || !db) {
        // Pas de Firebase → on retourne les données locales immédiatement
        onData({ events: loadLocalEvents(), source: 'local' });
        return () => { }; // pas de cleanup nécessaire
    }

    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const events = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            onData({ events, source: 'firebase' });
        },
        (err) => {
            console.error('[EventsService] Erreur temps réel :', err);
            if (onError) onError(err);
        }
    );

    return unsubscribe;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Ajouter un événement
// ─────────────────────────────────────────────────────────────────────────────
export const addEvent = async (eventData) => {
    const payload = {
        ...eventData,
        createdAt: isConfigured && db ? serverTimestamp() : Date.now(),
    };

    if (!isConfigured || !db) {
        const localEvent = { ...payload, id: `local_${Date.now()}`, createdAt: Date.now() };
        saveLocalEvent(localEvent);
        return { success: true, event: localEvent, source: 'local' };
    }

    try {
        const docRef = await addDoc(collection(db, COLLECTION), payload);
        return { success: true, id: docRef.id, source: 'firebase' };
    } catch (err) {
        console.error('[EventsService] Erreur écriture Firestore :', err);
        // Fallback local en cas d'erreur
        const localEvent = { ...payload, id: `local_${Date.now()}`, createdAt: Date.now() };
        saveLocalEvent(localEvent);
        return { success: false, event: localEvent, source: 'local', error: err.message };
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Supprimer un événement (admin uniquement)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteEvent = async (eventId) => {
    if (!isConfigured || !db) {
        // Suppression locale
        const existing = loadLocalEvents();
        const updated = existing.filter(e => String(e.id) !== String(eventId));
        localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
        return { success: true, source: 'local' };
    }

    try {
        await deleteDoc(doc(db, COLLECTION, eventId));
        return { success: true, source: 'firebase' };
    } catch (err) {
        console.error('[EventsService] Erreur suppression Firestore :', err);
        return { success: false, error: err.message };
    }
};

export { isConfigured };
