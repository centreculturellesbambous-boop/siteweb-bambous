import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Tag, ArrowLeft, MapPin, Share2, Phone, X, Check, ZoomIn } from 'lucide-react';
import { subscribeToContent } from '../lib/contentService';
import initialContent from '../data/content.json';
import extraEvents from '../data/events.json';
import '../styles/EventDetailPage.css';

// ── Fusion des deux sources ──────────────────────────────────────────────────
const loadAllEvents = (contentData) => {
    const baseEvents = (contentData && contentData.events) || initialContent.events || [];
    const baseIds = new Set(baseEvents.map(e => String(e.id)));
    const newOnes = extraEvents.filter(e => !baseIds.has(String(e.id)));
    return [...baseEvents, ...newOnes];
};

// ── Rendu de la description (supporte \n et listes à puces) ─────────────────
const RichDescription = ({ text }) => {
    if (!text) return null;
    const paragraphs = text.split(/\n\n+/);
    return (
        <div className="rich-description">
            {paragraphs.map((para, i) => {
                const lines = para.split('\n').filter(Boolean);
                const isList = lines.every(l => /^[•*-]/.test(l.trim()));
                if (isList) {
                    return (
                        <ul key={i} className="rich-list">
                            {lines.map((l, j) => (
                                <li key={j}>{l.replace(/^[•*-]\s*/, '')}</li>
                            ))}
                        </ul>
                    );
                }
                return <p key={i}>{para}</p>;
            })}
        </div>
    );
};

// ── Panneau de partage ───────────────────────────────────────────────────────
const SharePanel = ({ title, url }) => {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    const encoded = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(`🎭 ${title} — Centre Culturel Les Bambous\n`);

    const links = [
        {
            label: 'WhatsApp',
            icon: '💬',
            href: `https://wa.me/?text=${encodedTitle}${encoded}`,
            color: '#25D366',
        },
        {
            label: 'Facebook',
            icon: '📘',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
            color: '#1877F2',
        },
        {
            label: 'X / Twitter',
            icon: '🐦',
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
            color: '#000000',
        },
    ];

    const copyLink = () => {
        // Méthode compatible HTTP (pas besoin de HTTPS)
        try {
            const ta = document.createElement('textarea');
            ta.value = url;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            alert('Lien : ' + url);
        }
    };

    return (
        <div className="share-wrapper">
            <button className="btn btn-ghost" onClick={() => setOpen(v => !v)}>
                <Share2 size={16} /> Partager
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="share-panel"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                    >
                        {/* En-tête */}
                        <div className="share-panel-header">
                            <span>Partager cet événement</span>
                            <button onClick={() => setOpen(false)} className="share-close-btn">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Boutons sociaux */}
                        <div className="share-social-btns">
                            {links.map(l => (
                                <a
                                    key={l.label}
                                    href={l.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="share-social-btn"
                                    style={{ '--share-color': l.color }}
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="share-icon">{l.icon}</span>
                                    {l.label}
                                </a>
                            ))}
                        </div>

                        {/* Copier le lien */}
                        <div className="share-copy-row">
                            <span className="share-url-text">{url}</span>
                            <button className="share-copy-btn" onClick={copyLink}>
                                {copied ? <><Check size={14} /> Copié !</> : 'Copier'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Page principale ──────────────────────────────────────────────────────────
const EventDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [siteContent, setSiteContent] = useState(initialContent);

    useEffect(() => {
        const unsub = subscribeToContent(({ content }) => {
            if (content) setSiteContent(content);
        });
        return () => unsub();
    }, []);

    const allEvents = useMemo(() => loadAllEvents(siteContent), [siteContent]);
    const event = allEvents.find(e => String(e.id) === id);

    if (!event) {
        return (
            <div className="event-detail-notfound">
                <h2>Événement introuvable</h2>
                <Link to="/evenements" className="btn btn-primary">← Retour aux événements</Link>
            </div>
        );
    }

    const formattedDate = new Date(event.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const showTime = event.time && event.time !== '00:00';

    const related = allEvents
        .filter(e => String(e.id) !== id && e.category === event.category)
        .slice(0, 3);

    const pageUrl = window.location.href;

    return (
        <div className="event-detail-page">

            {/* ── Hero avec affiche ── */}
            <section className="event-detail-hero">
                <div
                    className="event-detail-hero-bg"
                    style={{ backgroundImage: `url(${event.image})` }}
                />

                <button className="event-detail-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Retour
                </button>

                <motion.div
                    className="event-detail-poster-wrapper"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    onClick={() => setIsLightboxOpen(true)}
                    title="Cliquer pour afficher l'affiche en grand"
                >
                    <img src={event.image} alt={event.title} className="event-detail-poster" />
                    <div className="poster-zoom-hint">
                        <ZoomIn size={14} /> Agrandir
                    </div>
                </motion.div>
            </section>

            {/* ── Lightbox Plein Écran ── */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        className="poster-lightbox-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <button
                            className="poster-lightbox-close"
                            onClick={() => setIsLightboxOpen(false)}
                            aria-label="Fermer"
                        >
                            <X size={22} />
                        </button>
                        <motion.img
                            src={event.image}
                            alt={event.title}
                            className="poster-lightbox-image"
                            initial={{ scale: 0.88, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.88, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Contenu principal ── */}
            <section className="event-detail-body">
                <div className="container event-detail-container">

                    <motion.div
                        className="event-detail-card"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <span className="event-detail-badge">
                            <Tag size={13} /> {event.category}
                        </span>

                        <h1 className="event-detail-title">{event.title}</h1>

                        {/* Métadonnées */}
                        <div className="event-detail-meta">
                            <div className="event-meta-item">
                                <Calendar size={18} />
                                <div>
                                    <span className="meta-label">Date</span>
                                    <span className="meta-value">{formattedDate}</span>
                                </div>
                            </div>
                            {showTime && (
                                <div className="event-meta-item">
                                    <Clock size={18} />
                                    <div>
                                        <span className="meta-label">Heure</span>
                                        <span className="meta-value">{event.time}</span>
                                    </div>
                                </div>
                            )}
                            <div className="event-meta-item">
                                <MapPin size={18} />
                                <div>
                                    <span className="meta-label">Lieu</span>
                                    <span className="meta-value">Centre Culturel Les Bambous, Bobo-Dioulasso</span>
                                </div>
                            </div>
                        </div>

                        <hr className="event-detail-divider" />

                        {/* Description riche */}
                        <div className="event-detail-description">
                            <h2>À propos de cet événement</h2>
                            <RichDescription text={event.description} />
                        </div>

                        <hr className="event-detail-divider" />

                        {/* Actions */}
                        <div className="event-detail-actions">
                            <Link to="/contact" className="btn btn-primary">
                                Nous contacter
                            </Link>
                            <a href="tel:+22665311433" className="btn btn-outline">
                                <Phone size={16} /> Appeler
                            </a>
                            <SharePanel title={event.title} url={pageUrl} />
                        </div>
                    </motion.div>

                    {/* ── Événements liés ── */}
                    {related.length > 0 && (
                        <motion.div
                            className="event-detail-related"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="related-title">Autres événements similaires</h2>
                            <div className="related-grid">
                                {related.map(rel => (
                                    <Link
                                        key={rel.id}
                                        to={`/evenements/${rel.id}`}
                                        className="related-card"
                                    >
                                        <img src={rel.image} alt={rel.title} />
                                        <div className="related-card-info">
                                            <span className="related-card-cat">{rel.category}</span>
                                            <span className="related-card-title">{rel.title}</span>
                                            <span className="related-card-date">
                                                {new Date(rel.date).toLocaleDateString('fr-FR', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default EventDetailPage;
