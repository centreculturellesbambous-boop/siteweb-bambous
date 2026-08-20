import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock,
    LogOut,
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Calendar,
    FileText,
    Image as ImageIcon,
    X,
    Eye,
    Shield,
    Sparkles,
    Bold,
    Italic,
    Heading2,
    Quote,
    List,
    TrendingUp,
    Check,
    HelpCircle,
    Settings,
    Video,
    Music,
    FolderPlus
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { subscribeToArticles, addArticle, updateArticle, deleteArticle } from '../lib/blogService';
import { subscribeToEvents, addEvent, deleteEvent } from '../lib/eventsService';
import { subscribeToGallery, addGalleryItem, deleteGalleryItem } from '../lib/galleryService';
import { subscribeToContent, updateFullContent } from '../lib/contentService';
import MediaLibraryModal from '../components/MediaLibraryModal';
import initialContent from '../data/content.json';
import '../styles/AdminPage.css';

const AdminPage = () => {
    const { isAdmin, login, logout } = useAuth();

    // Connexion State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // Active Tab: 'blog' | 'events' | 'gallery'
    const [activeTab, setActiveTab] = useState('blog');

    // Data States
    const [articles, setArticles] = useState([]);
    const [events, setEvents] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [blogSource, setBlogSource] = useState('local');

    // Filter/Search
    const [searchQuery, setSearchQuery] = useState('');

    // Modal Article State
    const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
    const [modalSubTab, setModalSubTab] = useState('edit'); // 'edit' | 'preview'
    const [editingArticle, setEditingArticle] = useState(null);
    const [articleForm, setArticleForm] = useState({
        title: '',
        category: 'Création',
        status: 'published',
        date: new Date().toISOString().split('T')[0],
        author: "Centre Culturel Les Bambous",
        authorRole: "Équipe de rédaction",
        coverImage: '/images/AMAZONE DE SIA 02.jpeg',
        excerpt: '',
        content: ''
    });

    // Modal Event State
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventForm, setEventForm] = useState({
        title: '',
        category: 'Spectacle',
        status: 'published',
        date: new Date().toISOString().split('T')[0],
        time: '19:30',
        description: '',
        image: '/images/slider1.jpg'
    });

    // Modal Gallery State
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [galleryForm, setGalleryForm] = useState({
        title: '',
        category: 'Spectacle',
        type: 'image',
        url: '/images/slider1.jpg'
    });

    // Site Content State
    const [siteContent, setSiteContent] = useState(initialContent);

    // Media Library Modal State
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    // Toast Notification State
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Subscriptions
    useEffect(() => {
        if (!isAdmin) return;

        const unsubBlog = subscribeToArticles(({ articles, source }) => {
            setArticles(articles);
            setBlogSource(source);
        });

        const unsubEvents = subscribeToEvents(({ events }) => {
            setEvents(events);
        });

        const unsubGallery = subscribeToGallery(({ items }) => {
            setGallery(items);
        });

        const unsubContent = subscribeToContent(({ content }) => {
            setSiteContent(content);
        });

        return () => {
            unsubBlog();
            unsubEvents();
            unsubGallery();
            unsubContent();
        };
    }, [isAdmin]);

    // Handle Login
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setAuthError('');
        const res = login(username, password);
        if (!res.success) {
            setAuthError(res.message);
        } else {
            showToast('Connexion réussie ! Bienvenue dans votre espace administration.');
        }
    };

    // Helper formatting for textarea
    const insertFormatting = (tagStart, tagEnd = '') => {
        const textarea = document.getElementById('article-content-textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = articleForm.content;
        const selected = text.substring(start, end) || 'texte';
        const replacement = `${tagStart}${selected}${tagEnd}`;
        const newText = text.substring(0, start) + replacement + text.substring(end);

        setArticleForm({ ...articleForm, content: newText });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + selected.length);
        }, 50);
    };

    // Open Modal Create/Edit Article
    const openArticleModal = (article = null) => {
        setModalSubTab('edit');
        if (article) {
            setEditingArticle(article);
            setArticleForm({
                title: article.title || '',
                category: article.category || 'Création',
                date: article.date || new Date().toISOString().split('T')[0],
                author: article.author || 'Centre Culturel Les Bambous',
                authorRole: article.authorRole || 'Équipe de rédaction',
                coverImage: article.coverImage || '/images/AMAZONE DE SYA 02.jpeg',
                excerpt: article.excerpt || '',
                content: article.content || ''
            });
        } else {
            setEditingArticle(null);
            setArticleForm({
                title: '',
                category: 'Création',
                date: new Date().toISOString().split('T')[0],
                author: 'Centre Culturel Les Bambous',
                authorRole: 'Équipe de rédaction',
                coverImage: '/images/AMAZONE DE SYA 02.jpeg',
                excerpt: '',
                content: ''
            });
        }
        setIsArticleModalOpen(true);
    };

    // Save Article (Create or Edit)
    const handleSaveArticle = async (e) => {
        e.preventDefault();
        if (!articleForm.title || !articleForm.content) {
            showToast('Le titre et le contenu principal sont requis.', 'error');
            return;
        }

        let res;
        if (editingArticle) {
            res = await updateArticle(editingArticle.id, articleForm);
            if (res.success) {
                showToast(`Article "${articleForm.title}" corrigé avec succès !`);
            } else {
                showToast(`Erreur lors de la modification : ${res.error}`, 'error');
            }
        } else {
            res = await addArticle(articleForm);
            if (res.success) {
                showToast(`Nouvel article "${articleForm.title}" publié avec succès !`);
            } else {
                showToast(`Erreur lors de la création : ${res.error}`, 'error');
            }
        }

        setIsArticleModalOpen(false);
    };

    // Delete Article
    const handleDeleteArticle = async (article) => {
        if (window.confirm(`Voulez-vous vraiment supprimer l'article "${article.title}" ?`)) {
            const res = await deleteArticle(article.id);
            if (res.success) {
                showToast('Article supprimé.');
            } else {
                showToast('Erreur lors de la suppression.', 'error');
            }
        }
    };

    // Save Event
    const handleSaveEvent = async (e) => {
        e.preventDefault();
        if (!eventForm.title || !eventForm.date) {
            showToast('Veuillez remplir le titre et la date.', 'error');
            return;
        }
        const res = await addEvent(eventForm);
        if (res.success) {
            showToast('Nouvel événement ajouté au programme !');
            setIsEventModalOpen(false);
            setEventForm({
                title: '',
                category: 'Spectacle',
                date: new Date().toISOString().split('T')[0],
                time: '19:30',
                description: '',
                image: '/images/slider1.jpg'
            });
        }
    };

    // Delete Event
    const handleDeleteEvent = async (event) => {
        if (window.confirm(`Supprimer l'événement "${event.title}" ?`)) {
            await deleteEvent(event.id);
            showToast('Événement retiré.');
        }
    };

    // Save Gallery
    const handleSaveGallery = async (e) => {
        e.preventDefault();
        if (!galleryForm.title || !galleryForm.url) {
            showToast('Veuillez renseigner un titre et une URL.', 'error');
            return;
        }
        const res = await addGalleryItem(galleryForm);
        if (res.success) {
            showToast('Média ajouté à la galerie !');
            setIsGalleryModalOpen(false);
            setGalleryForm({
                title: '',
                category: 'Spectacle',
                type: 'image',
                url: '/images/slider1.jpg'
            });
        }
    };

    // Delete Gallery
    const handleDeleteGallery = async (item) => {
        if (window.confirm(`Supprimer le média "${item.title}" ?`)) {
            await deleteGalleryItem(item.id);
            showToast('Média supprimé de la galerie.');
        }
    };

    // Filtered articles
    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ─────────────────────────────────────────────────────────────────────────────
    // UI: Formulaire de Connexion
    // ─────────────────────────────────────────────────────────────────────────────
    if (!isAdmin) {
        return (
            <div className="admin-login-wrapper">
                <motion.div
                    className="admin-login-card glass-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="login-icon-box">
                        <Shield size={36} className="text-accent" />
                    </div>
                    <h2>Espace Administration</h2>
                    <p className="login-subtext">
                        Connectez-vous pour rédiger, corriger des articles et gérer le contenu du Centre Culturel Les Bambous.
                    </p>

                    {authError && (
                        <div className="auth-error-alert">
                            <AlertCircle size={18} />
                            <span>{authError}</span>
                        </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Identifiant</label>
                            <input
                                id="username"
                                type="text"
                                className="form-control"
                                placeholder="Entrez votre identifiant"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-login">
                            <Lock size={18} /> Se connecter à l'Espace Admin
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // UI: Dashboard Admin Connecté
    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <div className="admin-dashboard-page">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`admin-toast ${toast.type}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                        <span>{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Banner */}
            <div className="admin-header-banner">
                <div className="container admin-header-content">
                    <div className="admin-title-box">
                        <span className="badge badge-accent">
                            <Sparkles size={14} /> Mode Administration Actif
                        </span>
                        <h1>Gestion & Rédaction du Site</h1>
                        <p className="admin-mode-indicator">
                            Base de données : <strong>{blogSource === 'firebase' ? 'Firebase Firestore (En ligne)' : 'Stockage Local & Synchronisé'}</strong>
                        </p>
                    </div>

                    <button onClick={logout} className="btn btn-outline btn-logout">
                        <LogOut size={18} /> Déconnexion
                    </button>
                </div>
            </div>

            <div className="container admin-body">

                {/* KPI Metrics Dashboard */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon-box green">
                            <FileText size={24} />
                        </div>
                        <div className="kpi-data">
                            <span className="kpi-value">{articles.length}</span>
                            <span className="kpi-label">Articles de Blog</span>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon-box blue">
                            <Calendar size={24} />
                        </div>
                        <div className="kpi-data">
                            <span className="kpi-value">{events.length}</span>
                            <span className="kpi-label">Événements au Programme</span>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon-box purple">
                            <ImageIcon size={24} />
                        </div>
                        <div className="kpi-data">
                            <span className="kpi-value">{gallery.length}</span>
                            <span className="kpi-label">Médias Galerie</span>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon-box orange">
                            <TrendingUp size={24} />
                        </div>
                        <div className="kpi-data">
                            <span className="kpi-value">En direct</span>
                            <span className="kpi-label">Synchronisation auto</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="admin-tabs-bar">
                    <button
                        className={`admin-tab-btn ${activeTab === 'blog' ? 'active' : ''}`}
                        onClick={() => setActiveTab('blog')}
                    >
                        <FileText size={18} />
                        Articles du Blog ({articles.length})
                    </button>
                    <button
                        className={`admin-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                        onClick={() => setActiveTab('events')}
                    >
                        <Calendar size={18} />
                        Événements ({events.length})
                    </button>
                    <button
                        className={`admin-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                        onClick={() => setActiveTab('gallery')}
                    >
                        <ImageIcon size={18} />
                        Galerie Média ({gallery.length})
                    </button>
                    <button
                        className={`admin-tab-btn ${activeTab === 'config' ? 'active' : ''}`}
                        onClick={() => setActiveTab('config')}
                    >
                        <Settings size={18} />
                        Textes & Infos du Site
                    </button>
                </div>

                {/* ── ONGLET BLOG ── */}
                {activeTab === 'blog' && (
                    <div className="tab-content-panel">
                        <div className="action-bar">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Rechercher un article par titre ou catégorie..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                            <button onClick={() => openArticleModal()} className="btn btn-primary">
                                <Plus size={18} /> Rédiger un Article
                            </button>
                        </div>

                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Couverture</th>
                                        <th>Titre / Extrait</th>
                                        <th>Catégorie</th>
                                        <th>Date & Auteur</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredArticles.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-state">
                                                Aucun article trouvé. Cliquez sur "Rédiger un Article" pour ajouter un nouvel article.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredArticles.map((art) => (
                                            <tr key={art.id}>
                                                <td className="col-img">
                                                    <img
                                                        src={art.coverImage || '/images/AMAZONE DE SYA 02.jpeg'}
                                                        alt={art.title}
                                                        className="table-thumb"
                                                    />
                                                </td>
                                                <td className="col-title">
                                                    <strong className="article-title">{art.title}</strong>
                                                    <p className="article-excerpt-preview">{art.excerpt}</p>
                                                </td>
                                                <td>
                                                    <span className="badge badge-category">{art.category}</span>
                                                </td>
                                                <td className="col-meta">
                                                    <div className="meta-item"><Calendar size={13} /> {art.date}</div>
                                                    <div className="meta-author">{art.author}</div>
                                                </td>
                                                <td className="col-actions">
                                                    <button
                                                        onClick={() => openArticleModal(art)}
                                                        className="btn-action edit"
                                                        title="Modifier / Corriger l'article"
                                                    >
                                                        <Edit3 size={16} /> Corriger
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteArticle(art)}
                                                        className="btn-action delete"
                                                        title="Supprimer l'article"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── ONGLET ÉVÉNEMENTS ── */}
                {activeTab === 'events' && (
                    <div className="tab-content-panel">
                        <div className="action-bar flex-end">
                            <button onClick={() => setIsEventModalOpen(true)} className="btn btn-primary">
                                <Plus size={18} /> Ajouter un Événement
                            </button>
                        </div>

                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Visuel</th>
                                        <th>Titre & Description</th>
                                        <th>Catégorie</th>
                                        <th>Date & Heure</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-state">
                                                Aucun événement dynamique ajouté.
                                            </td>
                                        </tr>
                                    ) : (
                                        events.map((ev) => (
                                            <tr key={ev.id}>
                                                <td>
                                                    <img src={ev.image} alt={ev.title} className="table-thumb" />
                                                </td>
                                                <td>
                                                    <strong>{ev.title}</strong>
                                                    <p className="article-excerpt-preview">{ev.description}</p>
                                                </td>
                                                <td><span className="badge badge-category">{ev.category}</span></td>
                                                <td>{ev.date} à {ev.time}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteEvent(ev)}
                                                        className="btn-action delete"
                                                    >
                                                        <Trash2 size={16} /> Supprimer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── ONGLET GALERIE ── */}
                {activeTab === 'gallery' && (
                    <div className="tab-content-panel">
                        <div className="action-bar flex-end">
                            <button onClick={() => setIsGalleryModalOpen(true)} className="btn btn-primary">
                                <Plus size={18} /> Ajouter une Image / Vidéo
                            </button>
                        </div>

                        <div className="admin-grid-gallery">
                            {gallery.length === 0 ? (
                                <p className="empty-state">Aucun média dans la galerie dynamique.</p>
                            ) : (
                                gallery.map((item) => (
                                    <div key={item.id} className="gallery-admin-card">
                                        <img src={item.url} alt={item.title} />
                                        <div className="card-overlay">
                                            <h4>{item.title}</h4>
                                            <span className="badge">{item.category}</span>
                                            <button
                                                onClick={() => handleDeleteGallery(item)}
                                                className="btn-action delete btn-sm mt-2"
                                            >
                                                <Trash2 size={14} /> Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ── ONGLET CONFIGURATION DU SITE ── */}
                {activeTab === 'config' && (
                    <div className="tab-content-panel">
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const res = await updateFullContent(siteContent);
                                if (res.success) {
                                    showToast('Informations et textes du site mis à jour avec succès !');
                                } else {
                                    showToast('Erreur lors de la sauvegarde.', 'error');
                                }
                            }}
                            className="admin-config-form"
                        >
                            <div className="config-section-card">
                                <h3><Settings size={18} /> Coordonnées & Contact Général</h3>
                                <div className="form-grid-3">
                                    <div className="form-group">
                                        <label>Adresse Physique</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={siteContent.siteMetadata?.contact?.address || ''}
                                            onChange={(e) => setSiteContent({
                                                ...siteContent,
                                                siteMetadata: {
                                                    ...siteContent.siteMetadata,
                                                    contact: { ...siteContent.siteMetadata.contact, address: e.target.value }
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Téléphone(s)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={siteContent.siteMetadata?.contact?.phone || ''}
                                            onChange={(e) => setSiteContent({
                                                ...siteContent,
                                                siteMetadata: {
                                                    ...siteContent.siteMetadata,
                                                    contact: { ...siteContent.siteMetadata.contact, phone: e.target.value }
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Officiel</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={siteContent.siteMetadata?.contact?.email || ''}
                                            onChange={(e) => setSiteContent({
                                                ...siteContent,
                                                siteMetadata: {
                                                    ...siteContent.siteMetadata,
                                                    contact: { ...siteContent.siteMetadata.contact, email: e.target.value }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="config-section-card mt-4">
                                <h3><FileText size={18} /> Présentation sur la Page d'Accueil</h3>
                                <div className="form-group">
                                    <label>Titre de Présentation</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={siteContent.home?.presentation?.title || ''}
                                        onChange={(e) => setSiteContent({
                                            ...siteContent,
                                            home: {
                                                ...siteContent.home,
                                                presentation: { ...siteContent.home.presentation, title: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Texte descriptif de présentation</label>
                                    <textarea
                                        rows="4"
                                        className="form-control"
                                        value={siteContent.home?.presentation?.text || ''}
                                        onChange={(e) => setSiteContent({
                                            ...siteContent,
                                            home: {
                                                ...siteContent.home,
                                                presentation: { ...siteContent.home.presentation, text: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="action-bar flex-end mt-4">
                                <button type="submit" className="btn btn-primary">
                                    <CheckCircle2 size={18} /> Enregistrer la Configuration du Site
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* ─────────────────────────────────────────────────────────────────────────────
                MODAL ÉDITION ARTICLE AVEC BARRE D'OUTILS ET APERÇU DIRECT
            ───────────────────────────────────────────────────────────────────────────── */}
            {isArticleModalOpen && (
                <div className="admin-modal-backdrop">
                    <motion.div
                        className="admin-modal-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="modal-header">
                            <h3>
                                <Edit3 size={20} />
                                {editingArticle ? 'Corriger / Modifier l\'Article' : 'Rédiger un Nouvel Article'}
                            </h3>
                            <button onClick={() => setIsArticleModalOpen(false)} className="btn-close">
                                <X size={22} />
                            </button>
                        </div>

                        {/* Modal Sub-tabs: Edit vs Live Preview */}
                        <div className="modal-subtabs">
                            <button
                                className={`subtab-btn ${modalSubTab === 'edit' ? 'active' : ''}`}
                                onClick={() => setModalSubTab('edit')}
                            >
                                <Edit3 size={15} /> Rédaction & Édition
                            </button>
                            <button
                                className={`subtab-btn ${modalSubTab === 'preview' ? 'active' : ''}`}
                                onClick={() => setModalSubTab('preview')}
                            >
                                <Eye size={15} /> Aperçu Visuel Direct
                            </button>
                        </div>

                        {modalSubTab === 'edit' ? (
                            <form onSubmit={handleSaveArticle} className="modal-form">
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Titre de l'Article *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: La résidence des Amazones de Sya..."
                                            value={articleForm.title}
                                            onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Catégorie</label>
                                        <select
                                            className="form-control"
                                            value={articleForm.category}
                                            onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                                        >
                                            <option value="Création">Création</option>
                                            <option value="Événement">Événement</option>
                                            <option value="Formation">Formation</option>
                                            <option value="Culture">Culture</option>
                                            <option value="Témoignage">Témoignage</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-grid-3">
                                    <div className="form-group">
                                        <label>Date de publication</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={articleForm.date}
                                            onChange={(e) => setArticleForm({ ...articleForm, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Auteur</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={articleForm.author}
                                            onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Rôle de l'auteur</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Chargé de communication"
                                            value={articleForm.authorRole}
                                            onChange={(e) => setArticleForm({ ...articleForm, authorRole: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Image de couverture (URL ou chemin local)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="/images/AMAZONE DE SYA 02.jpeg"
                                        value={articleForm.coverImage}
                                        onChange={(e) => setArticleForm({ ...articleForm, coverImage: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Résumé / Extrait d'introduction</label>
                                    <textarea
                                        rows="2"
                                        className="form-control"
                                        placeholder="Résumé court affiché sur les cartes du blog..."
                                        value={articleForm.excerpt}
                                        onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                                    />
                                </div>

                                {/* Rich Text Helper Toolbar */}
                                <div className="form-group">
                                    <div className="editor-toolbar-header">
                                        <label>Contenu complet de l'Article *</label>
                                        <div className="editor-toolbar">
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('**', '**')}
                                                className="btn-toolbar"
                                                title="Texte en Gras"
                                            >
                                                <Bold size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('*', '*')}
                                                className="btn-toolbar"
                                                title="Texte en Italique"
                                            >
                                                <Italic size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('\n\n## ', '\n')}
                                                className="btn-toolbar"
                                                title="Titre de Section"
                                            >
                                                <Heading2 size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('\n\n> ', '\n')}
                                                className="btn-toolbar"
                                                title="Citation / Punctum"
                                            >
                                                <Quote size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('\n• ', '\n• ')}
                                                className="btn-toolbar"
                                                title="Liste à puces"
                                            >
                                                <List size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('\n\n[youtube:ID_VIDEO_YOUTUBE]\n\n')}
                                                className="btn-toolbar"
                                                title="Intégrer Vidéo YouTube"
                                            >
                                                <Video size={15} /> Vidéo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('\n\n[audio:URL_FICHIER_AUDIO]\n\n')}
                                                className="btn-toolbar"
                                                title="Intégrer Lecteur Audio"
                                            >
                                                <Music size={15} /> Audio
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsMediaModalOpen(true)}
                                                className="btn-toolbar btn-highlight"
                                                title="Choisir une photo dans la Médiathèque"
                                            >
                                                <ImageIcon size={15} /> 🖼️ Choisir Photo...
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('[size:lg]', '[/size]')}
                                                className="btn-toolbar"
                                                title="Agrandir le texte (Taille L)"
                                            >
                                                🔍 Grand texte
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('[size:xl]', '[/size]')}
                                                className="btn-toolbar"
                                                title="Très grand texte (Taille XL - Zoom)"
                                            >
                                                🔍🔍 Zoom XL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('[color:#059669]', '[/color]')}
                                                className="btn-toolbar"
                                                style={{ color: '#059669', fontWeight: 'bold' }}
                                                title="Texte en Vert Émeraude"
                                            >
                                                🟢 Vert
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('[color:#F59E0B]', '[/color]')}
                                                className="btn-toolbar"
                                                style={{ color: '#D97706', fontWeight: 'bold' }}
                                                title="Texte en Doré"
                                            >
                                                🟡 Doré
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('[color:#DC2626]', '[/color]')}
                                                className="btn-toolbar"
                                                style={{ color: '#DC2626', fontWeight: 'bold' }}
                                                title="Texte en Rouge"
                                            >
                                                🔴 Rouge
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('[color:#2563EB]', '[/color]')}
                                                className="btn-toolbar"
                                                style={{ color: '#2563EB', fontWeight: 'bold' }}
                                                title="Texte en Bleu"
                                            >
                                                🔵 Bleu
                                            </button>
                                            <div className="btn-toolbar-color-picker" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0 0.4rem', border: '1px solid #CBD5E1', borderRadius: '8px', background: '#F8FAFC' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B' }}>🎨 Autre couleur :</span>
                                                <input
                                                    type="color"
                                                    onChange={(e) => insertFormatting(`[color:${e.target.value}]`, '[/color]')}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', width: '26px', height: '24px' }}
                                                    title="Choisir une couleur sur mesure"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('[highlight]', '[/highlight]')}
                                                className="btn-toolbar"
                                                title="Surligner le texte"
                                            >
                                                ✨ Surligner
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('\n\n[box]', '[/box]\n\n')}
                                                className="btn-toolbar"
                                                title="Insérer un encadré d'information"
                                            >
                                                📦 Encadré
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        id="article-content-textarea"
                                        rows="9"
                                        className="form-control content-textarea"
                                        placeholder="Rédigez le texte principal ici..."
                                        value={articleForm.content}
                                        onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" onClick={() => setIsArticleModalOpen(false)} className="btn btn-outline">
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <CheckCircle2 size={18} /> {editingArticle ? 'Enregistrer les corrections' : 'Publier l\'article'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* Live Visual Preview */
                            <div className="article-live-preview-box">
                                <div className="preview-header">
                                    <span className="badge badge-category">{articleForm.category || 'Catégorie'}</span>
                                    <h1 className="preview-title">{articleForm.title || 'Titre de l\'article'}</h1>
                                    <div className="preview-meta">
                                        <span>Par <strong>{articleForm.author || 'Auteur'}</strong> ({articleForm.authorRole})</span>
                                        <span>• {articleForm.date}</span>
                                    </div>
                                </div>

                                {articleForm.coverImage && (
                                    <div className="preview-cover shadow-lg">
                                        <img src={articleForm.coverImage} alt="Couverture" />
                                    </div>
                                )}

                                {articleForm.excerpt && (
                                    <blockquote className="preview-excerpt">
                                        {articleForm.excerpt}
                                    </blockquote>
                                )}

                                <div className="preview-body">
                                    {articleForm.content.split(/\n\n+/).map((para, idx) => (
                                        <p key={idx}>{para}</p>
                                    ))}
                                </div>

                                <div className="modal-actions">
                                    <button onClick={() => setModalSubTab('edit')} className="btn btn-outline">
                                        ← Revenir à l'édition
                                    </button>
                                    <button onClick={handleSaveArticle} className="btn btn-primary">
                                        <CheckCircle2 size={18} /> Valider & Publier
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* MODAL ÉVÉNEMENT */}
            {isEventModalOpen && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card sm">
                        <div className="modal-header">
                            <h3>Ajouter un Événement</h3>
                            <button onClick={() => setIsEventModalOpen(false)} className="btn-close"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveEvent} className="modal-form">
                            <div className="form-group">
                                <label>Titre de l'événement</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={eventForm.title}
                                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={eventForm.date}
                                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Heure</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={eventForm.time}
                                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows="3"
                                    className="form-control"
                                    value={eventForm.description}
                                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsEventModalOpen(false)} className="btn btn-outline">Annuler</button>
                                <button type="submit" className="btn btn-primary">Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL GALERIE */}
            {isGalleryModalOpen && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card sm">
                        <div className="modal-header">
                            <h3>Ajouter une Image à la Galerie</h3>
                            <button onClick={() => setIsGalleryModalOpen(false)} className="btn-close"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveGallery} className="modal-form">
                            <div className="form-group">
                                <label>Titre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={galleryForm.title}
                                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>URL de l'image</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={galleryForm.url}
                                    onChange={(e) => setGalleryForm({ ...galleryForm, url: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsGalleryModalOpen(false)} className="btn btn-outline">Annuler</button>
                                <button type="submit" className="btn btn-primary">Ajouter à la Galerie</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Media Library Modal */}
            <MediaLibraryModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                onSelectImage={(selectedUrl) => {
                    insertFormatting(`\n\n![Illustration](${selectedUrl})\n\n`);
                    setIsMediaModalOpen(false);
                    showToast('Photo insérée dans le texte de l\'article !');
                }}
            />
        </div>
    );
};

export default AdminPage;
