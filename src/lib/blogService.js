// ═══════════════════════════════════════════════════════════
//  Service Blog Firebase & Local (Firestore + Fallback)
//  Centre Culturel Les Bambous
// ═══════════════════════════════════════════════════════════

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';
import initialArticles from '../data/blog.json';

const COLLECTION = 'blog_articles';
const LOCAL_KEY = 'bambous_blog_articles_custom';
const LOCAL_MODIFIED_KEY = 'bambous_blog_articles_modified';

// ─────────────────────────────────────────────────────────────────────────────
//  Gestion LocalStorage (Fallback sans Firebase ou pour surcharger blog.json)
// ─────────────────────────────────────────────────────────────────────────────
const loadLocalArticles = () => {
    try {
        const custom = localStorage.getItem(LOCAL_KEY);
        const customArticles = custom ? JSON.parse(custom) : [];
        const modified = localStorage.getItem(LOCAL_MODIFIED_KEY);
        const modifiedArticles = modified ? JSON.parse(modified) : {};

        // Fusionner les articles de blog.json (mis à jour si modifiés) et les nouveaux articles créés
        const baseArticles = initialArticles.map(art => {
            if (modifiedArticles[art.id]) {
                return { ...art, ...modifiedArticles[art.id] };
            }
            return art;
        }).filter(art => !art._deleted);

        // Filtrer les custom qui auraient été supprimés
        const validCustom = customArticles.filter(art => !art._deleted);

        // Trier par date décroissante
        const all = [...validCustom, ...baseArticles];
        return all.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (err) {
        console.error('[BlogService] Erreur chargement local :', err);
        return initialArticles;
    }
};

const saveLocalArticle = (article) => {
    try {
        const custom = localStorage.getItem(LOCAL_KEY);
        const existing = custom ? JSON.parse(custom) : [];
        const index = existing.findIndex(a => String(a.id) === String(article.id));
        
        let updated;
        if (index >= 0) {
            updated = [...existing];
            updated[index] = article;
        } else {
            updated = [article, ...existing];
        }
        localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    } catch (err) {
        console.error('[BlogService] Erreur sauvegarde article local :', err);
    }
};

const updateLocalArticle = (article) => {
    try {
        // Si c'est un article originel de blog.json (id numérique)
        const isBaseArticle = initialArticles.some(a => String(a.id) === String(article.id));
        if (isBaseArticle) {
            const modified = localStorage.getItem(LOCAL_MODIFIED_KEY);
            const modifiedMap = modified ? JSON.parse(modified) : {};
            modifiedMap[article.id] = article;
            localStorage.setItem(LOCAL_MODIFIED_KEY, JSON.stringify(modifiedMap));
        } else {
            saveLocalArticle(article);
        }
    } catch (err) {
        console.error('[BlogService] Erreur mise à jour article local :', err);
    }
};

const deleteLocalArticle = (articleId) => {
    try {
        const isBaseArticle = initialArticles.some(a => String(a.id) === String(articleId));
        if (isBaseArticle) {
            const modified = localStorage.getItem(LOCAL_MODIFIED_KEY);
            const modifiedMap = modified ? JSON.parse(modified) : {};
            modifiedMap[articleId] = { _deleted: true };
            localStorage.setItem(LOCAL_MODIFIED_KEY, JSON.stringify(modifiedMap));
        } else {
            const custom = localStorage.getItem(LOCAL_KEY);
            const existing = custom ? JSON.parse(custom) : [];
            const updated = existing.filter(a => String(a.id) !== String(articleId));
            localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
        }
    } catch (err) {
        console.error('[BlogService] Erreur suppression article local :', err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Méthodes Publiques & Firebase API
// ─────────────────────────────────────────────────────────────────────────────

export const fetchArticles = async () => {
    if (!isConfigured || !db) {
        return { articles: loadLocalArticles(), source: 'local' };
    }

    try {
        const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        let articles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        if (articles.length === 0) {
            // Si Firestore est vide, retourner le mix local/initial
            articles = loadLocalArticles();
        }

        return { articles, source: 'firebase' };
    } catch (err) {
        console.error('[BlogService] Erreur lecture Firestore :', err);
        return { articles: loadLocalArticles(), source: 'local', error: err.message };
    }
};

export const subscribeToArticles = (onData, onError) => {
    if (!isConfigured || !db) {
        onData({ articles: loadLocalArticles(), source: 'local' });
        
        // Écouter les évènements d'update local s'il y a lieu
        const handleStorage = () => onData({ articles: loadLocalArticles(), source: 'local' });
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }

    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            let articles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            if (articles.length === 0) {
                articles = loadLocalArticles();
            }
            onData({ articles, source: 'firebase' });
        },
        (err) => {
            console.error('[BlogService] Erreur temps réel Firestore :', err);
            onData({ articles: loadLocalArticles(), source: 'local' });
            if (onError) onError(err);
        }
    );

    return unsubscribe;
};

export const addArticle = async (articleData) => {
    const slug = articleData.slug || articleData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newArticle = {
        ...articleData,
        slug,
        date: articleData.date || new Date().toISOString().split('T')[0],
        createdAt: Date.now(),
    };

    if (!isConfigured || !db) {
        const localArt = { ...newArticle, id: `local_art_${Date.now()}` };
        saveLocalArticle(localArt);
        window.dispatchEvent(new Event('storage'));
        return { success: true, article: localArt, source: 'local' };
    }

    try {
        const payload = { ...newArticle, createdAt: serverTimestamp() };
        const docRef = await addDoc(collection(db, COLLECTION), payload);
        return { success: true, id: docRef.id, source: 'firebase' };
    } catch (err) {
        console.error('[BlogService] Erreur écriture Firestore :', err);
        const localArt = { ...newArticle, id: `local_art_${Date.now()}` };
        saveLocalArticle(localArt);
        window.dispatchEvent(new Event('storage'));
        return { success: false, article: localArt, source: 'local', error: err.message };
    }
};

export const updateArticle = async (articleId, articleData) => {
    const slug = articleData.slug || articleData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const updatedData = {
        ...articleData,
        slug,
        updatedAt: Date.now(),
    };

    if (!isConfigured || !db || String(articleId).startsWith('local_art_') || typeof articleId === 'number') {
        const fullArticle = { id: articleId, ...updatedData };
        updateLocalArticle(fullArticle);
        window.dispatchEvent(new Event('storage'));
        return { success: true, article: fullArticle, source: 'local' };
    }

    try {
        const docRef = doc(db, COLLECTION, String(articleId));
        await updateDoc(docRef, { ...updatedData, updatedAt: serverTimestamp() });
        return { success: true, source: 'firebase' };
    } catch (err) {
        console.error('[BlogService] Erreur mise à jour Firestore :', err);
        const fullArticle = { id: articleId, ...updatedData };
        updateLocalArticle(fullArticle);
        window.dispatchEvent(new Event('storage'));
        return { success: false, error: err.message };
    }
};

export const deleteArticle = async (articleId) => {
    if (!isConfigured || !db || String(articleId).startsWith('local_art_') || typeof articleId === 'number') {
        deleteLocalArticle(articleId);
        window.dispatchEvent(new Event('storage'));
        return { success: true, source: 'local' };
    }

    try {
        await deleteDoc(doc(db, COLLECTION, String(articleId)));
        deleteLocalArticle(articleId);
        window.dispatchEvent(new Event('storage'));
        return { success: true, source: 'firebase' };
    } catch (err) {
        console.error('[BlogService] Erreur suppression Firestore :', err);
        deleteLocalArticle(articleId);
        window.dispatchEvent(new Event('storage'));
        return { success: false, error: err.message };
    }
};
