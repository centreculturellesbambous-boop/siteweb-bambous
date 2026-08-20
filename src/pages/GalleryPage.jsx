import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Maximize2, X, Play,
    Image as ImageIcon, Youtube,
    ChevronLeft, ChevronRight, CalendarDays
} from 'lucide-react';
import galleryItems from '../data/gallery.json';
import '../styles/GalleryPage.css';

// ─── Utilitaires YouTube ───────────────────────────────────────────────────────
const getYoutubeId = (url) => {
    if (!url) return null;
    const patterns = [
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
};

const getYoutubeThumbnail = (videoId) =>
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

// ─── Formatage de date ────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const CATEGORIES = ['Tous', 'Présentation', 'Concerts', 'Danse', 'Théâtre', 'Ateliers', 'Cinéma', 'Mode', 'Résidences', 'Autre'];

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ item, onClose, onPrev, onNext, total, currentIndex }) => {
    const ytId = item.type === 'video' ? getYoutubeId(item.videoUrl || item.url) : null;

    React.useEffect(() => {
        const handle = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'ArrowRight') onNext();
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [onClose, onPrev, onNext]);

    return (
        <motion.div
            className="lightbox-institutional"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <button className="close-btn" onClick={onClose}><X size={28} /></button>

            <button className="lightbox-nav prev" onClick={e => { e.stopPropagation(); onPrev(); }}>
                <ChevronLeft size={32} />
            </button>

            <motion.div
                className="lightbox-box"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
            >
                {ytId ? (
                    <div className="lightbox-video-wrapper">
                        <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                            title={item.title || 'Vidéo'}
                            frameBorder="0"
                            allow="autoplay; encrypted-media; fullscreen"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <img src={item.url} alt={item.title || item.category} />
                )}
                <div className="lightbox-info">
                    <span className="lightbox-category">{item.category}</span>
                    {item.title && <h3>{item.title}</h3>}
                    {item.date && (
                        <p className="lightbox-date">
                            <CalendarDays size={13} /> {formatDate(item.date)}
                        </p>
                    )}
                    <p className="lightbox-counter">{currentIndex + 1} / {total}</p>
                </div>
            </motion.div>

            <button className="lightbox-nav next" onClick={e => { e.stopPropagation(); onNext(); }}>
                <ChevronRight size={32} />
            </button>
        </motion.div>
    );
};

// ─── Page Galerie ──────────────────────────────────────────────────────────────
const GalleryPage = () => {
    const [filter, setFilter] = useState('Tous');
    const [selectedIndex, setSelectedIndex] = useState(null);

    // Tri par date décroissante (plus récent en premier)
    const sortedItems = [...galleryItems].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });

    const filteredItems = filter === 'Tous'
        ? sortedItems
        : sortedItems.filter(i => i.category === filter);

    const countOf = (cat) => cat === 'Tous'
        ? galleryItems.length
        : galleryItems.filter(i => i.category === cat).length;

    const openLightbox = (index) => setSelectedIndex(index);
    const closeLightbox = () => setSelectedIndex(null);
    const prevItem = () => setSelectedIndex(i => (i - 1 + filteredItems.length) % filteredItems.length);
    const nextItem = () => setSelectedIndex(i => (i + 1) % filteredItems.length);

    return (
        <div className="gallery-page">

            {/* ── En-tête ── */}
            <section className="page-header bg-dark">
                <div className="container text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Galerie &amp; Mémoires
                    </motion.h1>
                    <motion.p
                        className="subtitle text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        L'histoire du centre à travers nos archives visuelles et vidéos
                    </motion.p>
                    <motion.div
                        className="gallery-stats"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <span className="stat-badge">
                            <ImageIcon size={14} />
                            {galleryItems.filter(i => i.type !== 'video').length} photos
                        </span>
                        <span className="stat-badge">
                            <Youtube size={14} />
                            {galleryItems.filter(i => i.type === 'video').length} vidéos
                        </span>
                    </motion.div>
                </div>
            </section>

            {/* ── Filtres + grille ── */}
            <section className="section-padding">
                <div className="container">

                    {/* Filtres */}
                    <div className="gallery-filters-institutional">
                        {CATEGORIES.map(cat => {
                            const count = countOf(cat);
                            return (
                                <button
                                    key={cat}
                                    className={`gallery-filter-btn-new ${filter === cat ? 'active' : ''}`}
                                    onClick={() => setFilter(cat)}
                                    disabled={count === 0 && cat !== 'Tous'}
                                >
                                    {cat}
                                    {count > 0 && <span className="filter-count">{count}</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Grille */}
                    {filteredItems.length === 0 ? (
                        <div className="gallery-empty">
                            <ImageIcon size={48} opacity={0.3} />
                            <p>Aucun média dans cette catégorie.</p>
                        </div>
                    ) : (
                        <motion.div layout className="gallery-masonry-refined">
                            <AnimatePresence>
                                {filteredItems.map((item, index) => {
                                    const ytId = item.type === 'video' ? getYoutubeId(item.videoUrl || item.url) : null;
                                    const thumbSrc = ytId ? getYoutubeThumbnail(ytId) : item.url;

                                    return (
                                        <motion.div
                                            layout
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4 }}
                                            className={`gallery-item-card ${item.type === 'video' ? 'is-video' : ''}`}
                                            onClick={() => openLightbox(index)}
                                        >
                                            <img src={thumbSrc} alt={item.title || item.category} loading="lazy" />

                                            <div className="gallery-item-overlay">
                                                <div className="overlay-icon">
                                                    {item.type === 'video'
                                                        ? <Play size={34} fill="white" />
                                                        : <Maximize2 size={26} />
                                                    }
                                                </div>
                                                {item.title && <span className="overlay-title">{item.title}</span>}
                                                <span className="category-tag-refined">{item.category}</span>
                                                {item.date && (
                                                    <span className="overlay-date">
                                                        <CalendarDays size={11} /> {formatDate(item.date)}
                                                    </span>
                                                )}
                                            </div>

                                            {item.type === 'video' && (
                                                <div className="video-badge">
                                                    <Youtube size={13} /> YouTube
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* ── Lightbox ── */}
            <AnimatePresence>
                {selectedIndex !== null && filteredItems[selectedIndex] && (
                    <Lightbox
                        item={filteredItems[selectedIndex]}
                        currentIndex={selectedIndex}
                        total={filteredItems.length}
                        onClose={closeLightbox}
                        onPrev={prevItem}
                        onNext={nextItem}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default GalleryPage;
