// ═══════════════════════════════════════════════════════════
//  Service Contenu du Site Firebase & Local (Firestore + Fallback)
//  Centre Culturel Les Bambous
// ═══════════════════════════════════════════════════════════

import {
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';
import initialContent from '../data/content.json';

const COLLECTION = 'site_content';
const DOC_ID = 'main_config';
const LOCAL_KEY = 'bambous_site_content_custom';

// ─────────────────────────────────────────────────────────────────────────────
//  Chargement Local & Storage
// ─────────────────────────────────────────────────────────────────────────────
const loadLocalContent = () => {
    try {
        const custom = localStorage.getItem(LOCAL_KEY);
        if (custom) {
            const parsed = JSON.parse(custom);
            // Fusionner avec le contenu initial pour assurer la rétrocompatibilité
            return {
                ...initialContent,
                ...parsed,
                siteMetadata: {
                    ...initialContent.siteMetadata,
                    ...(parsed.siteMetadata || {}),
                    contact: {
                        ...initialContent.siteMetadata.contact,
                        ...((parsed.siteMetadata && parsed.siteMetadata.contact) || {})
                    }
                },
                home: {
                    ...initialContent.home,
                    ...(parsed.home || {})
                }
            };
        }
        return initialContent;
    } catch (err) {
        console.error('[ContentService] Erreur chargement local :', err);
        return initialContent;
    }
};

const saveLocalContent = (newContent) => {
    try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(newContent));
        window.dispatchEvent(new Event('storage_content'));
    } catch (err) {
        console.error('[ContentService] Erreur sauvegarde locale :', err);
    }
};

// Helper pour modifier une clé imbriquée par chemin (ex: "home.presentation.title")
const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    for (const key of keys) {
        if (!current[key]) current[key] = {};
        current = current[key];
    }
    current[lastKey] = value;
};

// ─────────────────────────────────────────────────────────────────────────────
//  API & Subscriptions
// ─────────────────────────────────────────────────────────────────────────────

export const getContent = async () => {
    if (!isConfigured || !db) {
        return { content: loadLocalContent(), source: 'local' };
    }

    try {
        const docRef = doc(db, COLLECTION, DOC_ID);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
            return { content: { ...initialContent, ...snapshot.data() }, source: 'firebase' };
        }
        return { content: loadLocalContent(), source: 'local' };
    } catch (err) {
        console.error('[ContentService] Erreur lecture Firestore :', err);
        return { content: loadLocalContent(), source: 'local', error: err.message };
    }
};

export const subscribeToContent = (onData, onError) => {
    if (!isConfigured || !db) {
        onData({ content: loadLocalContent(), source: 'local' });

        const handleStorage = () => onData({ content: loadLocalContent(), source: 'local' });
        window.addEventListener('storage_content', handleStorage);
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('storage_content', handleStorage);
            window.removeEventListener('storage', handleStorage);
        };
    }

    const docRef = doc(db, COLLECTION, DOC_ID);
    const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
            if (snapshot.exists()) {
                onData({ content: { ...initialContent, ...snapshot.data() }, source: 'firebase' });
            } else {
                onData({ content: loadLocalContent(), source: 'local' });
            }
        },
        (err) => {
            console.error('[ContentService] Erreur temps réel Firestore :', err);
            onData({ content: loadLocalContent(), source: 'local' });
            if (onError) onError(err);
        }
    );

    return unsubscribe;
};

const REVISION_KEY = 'bambous_site_content_history';

// History Helper
const pushRevisionSnapshot = (content) => {
    try {
        const historyStr = localStorage.getItem(REVISION_KEY);
        let history = historyStr ? JSON.parse(historyStr) : [];
        const snapshot = {
            timestamp: new Date().toISOString(),
            content: JSON.parse(JSON.stringify(content))
        };
        // Conserver les 5 dernières révisions
        history = [snapshot, ...history].slice(0, 5);
        localStorage.setItem(REVISION_KEY, JSON.stringify(history));
    } catch (err) {
        console.error('[ContentService] Erreur sauvegarde historique :', err);
    }
};

export const getRevisionsHistory = () => {
    try {
        const historyStr = localStorage.getItem(REVISION_KEY);
        return historyStr ? JSON.parse(historyStr) : [];
    } catch {
        return [];
    }
};

export const restorePreviousRevision = async () => {
    const history = getRevisionsHistory();
    if (!history || history.length === 0) {
        return { success: false, message: "Aucune révision précédente disponible." };
    }
    const previous = history[0]; // La révision immédiatement précédente
    const newHistory = history.slice(1);
    localStorage.setItem(REVISION_KEY, JSON.stringify(newHistory));
    
    await updateFullContent(previous.content);
    return { success: true, timestamp: previous.timestamp };
};

export const updateFieldContent = async (fieldPath, newValue) => {
    const current = loadLocalContent();
    pushRevisionSnapshot(current);

    const updated = JSON.parse(JSON.stringify(current));
    setNestedValue(updated, fieldPath, newValue);

    saveLocalContent(updated);

    if (!isConfigured || !db) {
        return { success: true, content: updated, source: 'local' };
    }

    try {
        const docRef = doc(db, COLLECTION, DOC_ID);
        await setDoc(docRef, { ...updated, updatedAt: serverTimestamp() }, { merge: true });
        return { success: true, source: 'firebase' };
    } catch (err) {
        console.error('[ContentService] Erreur mise à jour Firestore :', err);
        return { success: true, content: updated, source: 'local', error: err.message };
    }
};

export const updateFullContent = async (newContent) => {
    const current = loadLocalContent();
    pushRevisionSnapshot(current);

    saveLocalContent(newContent);

    if (!isConfigured || !db) {
        return { success: true, content: newContent, source: 'local' };
    }

    try {
        const docRef = doc(db, COLLECTION, DOC_ID);
        await setDoc(docRef, { ...newContent, updatedAt: serverTimestamp() }, { merge: true });
        return { success: true, source: 'firebase' };
    } catch (err) {
        console.error('[ContentService] Erreur mise à jour Firestore :', err);
        return { success: true, content: newContent, source: 'local', error: err.message };
    }
};
