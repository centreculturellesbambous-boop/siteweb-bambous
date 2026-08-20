import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Tag, Share2, ArrowRight, Edit3, X, CheckCircle2 } from 'lucide-react';
import { subscribeToArticles, updateArticle } from '../lib/blogService';
import initialArticles from '../data/blog.json';
import InlineAdminBar from '../components/InlineAdminBar';
import '../styles/BlogDetailPage.css';

// Helper pour formater le texte en ligne (couleurs, polices, surlignage)
const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    
    // Remplace les balises de couleurs [color:#code]texte[/color]
    let html = rawText
        .replace(/\[color:([^\]]+)\]([\s\S]*?)\[\/color\]/g, '<span style="color:$1; font-weight:bold;">$2</span>')
        .replace(/\[font:heading\]([\s\S]*?)\[\/font\]/g, '<span style="font-family:var(--font-heading); font-weight:800; letter-spacing:-0.01em;">$1</span>')
        .replace(/\[size:lg\]([\s\S]*?)\[\/size\]/g, '<span style="font-size:1.35rem; line-height:1.6; font-weight:700; display:inline-block;">$1</span>')
        .replace(/\[size:xl\]([\s\S]*?)\[\/size\]/g, '<span style="font-size:1.85rem; line-height:1.3; font-weight:800; font-family:var(--font-heading); color:#0F172A; display:inline-block;">$1</span>')
        .replace(/\[highlight\]([\s\S]*?)\[\/highlight\]/g, '<mark style="background:rgba(245,158,11,0.25); color:#92400E; padding:0.15rem 0.4rem; border-radius:6px; font-weight:bold;">$1</mark>');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

// ── Rendu riche multimédia ───────────────────────────────────────────────────
const RichContent = ({ text }) => {
    if (!text) return null;
    const paragraphs = text.split(/\n\n+/);

    return (
        <div className="blog-rich-content">
            {paragraphs.map((para, i) => {
                const trimmed = para.trim();

                // Encadré d'information : [box]contenu[/box]
                const boxMatch = trimmed.match(/^\[box\]([\s\S]*?)\[\/box\]$/);
                if (boxMatch) {
                    return (
                        <div key={i} className="embed-box" style={{ margin: '1.75rem 0', padding: '1.25rem 1.5rem', background: '#ECFDF5', borderRadius: '16px', borderLeft: '5px solid #10B981', color: '#064E3B', boxShadow: '0 4px 12px rgba(16,185,129,0.08)' }}>
                            {renderFormattedText(boxMatch[1])}
                        </div>
                    );
                }

                // YouTube Embed : [youtube:VIDEO_ID]
                const ytMatch = trimmed.match(/^\[youtube:(.+)\]$/);
                if (ytMatch) {
                    const videoId = ytMatch[1].trim();
                    return (
                        <div key={i} className="embed-video-wrapper" style={{ margin: '2rem 0', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                                title="Vidéo YouTube"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    );
                }

                // Audio Player Embed : [audio:URL_AUDIO]
                const audioMatch = trimmed.match(/^\[audio:(.+)\]$/);
                if (audioMatch) {
                    const audioUrl = audioMatch[1].trim();
                    return (
                        <div key={i} className="embed-audio-wrapper" style={{ margin: '1.5rem 0', padding: '1.25rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0F172A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>🎵 Extrait Audio :</p>
                            <audio controls style={{ width: '100%' }} src={audioUrl}>
                                Votre navigateur ne prend pas en charge l'élément audio.
                            </audio>
                        </div>
                    );
                }

                // Image Embed : ![alt](url)
                const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
                if (imgMatch) {
                    const altText = imgMatch[1];
                    const imgUrl = imgMatch[2];
                    return (
                        <figure key={i} className="embed-image-wrapper" style={{ margin: '2rem 0', textAlign: 'center' }}>
                            <img src={imgUrl} alt={altText} style={{ width: '100%', borderRadius: '20px', maxHeight: '520px', objectFit: 'cover', boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }} />
                            {altText && <figcaption style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.6rem', fontStyle: 'italic' }}>{altText}</figcaption>}
                        </figure>
                    );
                }

                // Lists
                const lines = para.split('\n').filter(Boolean);
                const isList = lines.every(l => /^[•*-]/.test(l.trim()));
                if (isList) {
                    return (
                        <ul key={i} className="blog-rich-list">
                            {lines.map((l, j) => <li key={j}>{renderFormattedText(l.replace(/^[•*-]\s*/, ''))}</li>)}
                        </ul>
                    );
                }

                // Headings ##
                if (trimmed.startsWith('## ')) {
                    return <h3 key={i} style={{ fontSize: '1.5rem', fontWeight: 800, margin: '1.75rem 0 1rem', color: '#0F172A', fontFamily: 'var(--font-heading)' }}>{renderFormattedText(trimmed.replace(/^##\s*/, ''))}</h3>;
                }

                // Quotes >
                if (trimmed.startsWith('> ')) {
                    return <blockquote key={i} style={{ borderLeft: '4px solid #F59E0B', paddingLeft: '1.25rem', fontStyle: 'italic', margin: '1.5rem 0', color: '#334155', background: 'rgba(245,158,11,0.06)', padding: '1rem 1.25rem', borderRadius: '0 12px 12px 0' }}>{renderFormattedText(trimmed.replace(/^>\s*/, ''))}</blockquote>;
                }

                return <p key={i}>{renderFormattedText(para)}</p>;
            })}
        </div>
    );
};

// ── Copier le lien ────────────────────────────────────────────────────────────
const copyUrl = () => {
    try {
        const ta = document.createElement('textarea');
        ta.value = window.location.href;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Lien copié !');
    } catch {
        alert('Lien : ' + window.location.href);
    }
};

// ── Page ──────────────────────────────────────────────────────────────────────
const BlogDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [articles, setArticles] = useState(initialArticles);

    // Quick Edit State
    const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', category: '', excerpt: '', content: '' });

    useEffect(() => {
        const unsub = subscribeToArticles(({ articles }) => {
            setArticles(articles);
        });
        return () => unsub();
    }, []);

    const article = articles.find(a => String(a.id) === id || a.slug === id);
    const related = articles.filter(a => String(a.id) !== id && a.slug !== id).slice(0, 2);

    const openQuickEdit = () => {
        if (!article) return;
        setEditForm({
            title: article.title || '',
            category: article.category || 'Création',
            excerpt: article.excerpt || '',
            content: article.content || ''
        });
        setIsQuickEditOpen(true);
    };

    const handleSaveQuickEdit = async (e) => {
        e.preventDefault();
        if (!article) return;
        const res = await updateArticle(article.id, editForm);
        if (res.success) {
            alert('Article corrigé avec succès !');
            setIsQuickEditOpen(false);
        } else {
            alert('Erreur lors de la mise à jour : ' + res.error);
        }
    };

    if (!article) {
        return (
            <div className="blog-detail-notfound">
                <h2>Article introuvable</h2>
                <Link to="/blog" className="btn btn-primary">← Retour au blog</Link>
            </div>
        );
    }

    const formattedDate = new Date(article.date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const shareUrl = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(`📰 ${article.title} — Centre Culturel Les Bambous`);

    return (
        <div className="blog-detail-page">
            {/* Inline Admin Bar pour correction directe */}
            <InlineAdminBar
                onQuickEditArticle={openQuickEdit}
                currentArticleTitle={article.title}
            />

            {/* ── Hero ── */}
            <section className="blog-detail-hero">
                <div
                    className="blog-detail-hero-bg"
                    style={{ backgroundImage: `url(${article.coverImage})` }}
                />
                <button className="blog-detail-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Retour
                </button>
                <div className="container blog-detail-hero-content">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                    >
                        <span className="blog-cat-pill">{article.category}</span>
                        <h1 className="blog-detail-title">{article.title}</h1>
                        <div className="blog-detail-byline">
                            <span><User size={15} /> {article.author} — {article.authorRole}</span>
                            <span><Calendar size={15} /> {formattedDate}</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Corps ── */}
            <section className="blog-detail-body">
                <div className="container blog-detail-container">

                    <motion.article
                        className="blog-detail-card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        {/* Image principale */}
                        <div className="blog-detail-cover">
                            <img src={article.coverImage} alt={article.title} />
                        </div>

                        {/* Chapô */}
                        <p className="blog-detail-excerpt">{article.excerpt}</p>

                        <hr className="blog-detail-divider" />

                        {/* Contenu */}
                        <RichContent text={article.content} />

                        <hr className="blog-detail-divider" />

                        {/* Partage */}
                        <div className="blog-detail-share">
                            <span className="blog-share-label"><Share2 size={15} /> Partager :</span>
                            <a
                                href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                                target="_blank" rel="noopener noreferrer"
                                className="blog-share-btn blog-share-wa"
                            >
                                💬 WhatsApp
                            </a>
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                                target="_blank" rel="noopener noreferrer"
                                className="blog-share-btn blog-share-fb"
                            >
                                📘 Facebook
                            </a>
                            <button className="blog-share-btn blog-share-copy" onClick={copyUrl}>
                                📋 Copier le lien
                            </button>
                        </div>

                        {/* Auteur */}
                        <div className="blog-detail-author-box">
                            <div className="blog-author-avatar">
                                {article.author.charAt(0)}
                            </div>
                            <div>
                                <span className="blog-author-name">{article.author}</span>
                                <span className="blog-author-role">{article.authorRole}</span>
                                <span className="blog-author-org">Centre Culturel Les Bambous Idrissa Koné</span>
                            </div>
                        </div>
                    </motion.article>

                    {/* ── Articles liés ── */}
                    {related.length > 0 && (
                        <motion.div
                            className="blog-detail-related"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="blog-related-title">Autres articles</h2>
                            <div className="blog-related-grid">
                                {related.map(rel => (
                                    <Link key={rel.id} to={`/blog/${rel.id}`} className="blog-related-card">
                                        <img src={rel.coverImage} alt={rel.title} />
                                        <div className="blog-related-info">
                                            <span className="blog-cat-pill blog-cat-pill--sm">{rel.category}</span>
                                            <span className="blog-related-card-title">{rel.title}</span>
                                            <span className="blog-related-card-link">Lire <ArrowRight size={13} /></span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Quick Edit Modal */}
            {isQuickEditOpen && (
                <div className="admin-modal-backdrop">
                    <div className="admin-modal-card">
                        <div className="modal-header">
                            <h3><Edit3 size={20} /> Corriger l'article en direct</h3>
                            <button onClick={() => setIsQuickEditOpen(false)} className="btn-close"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveQuickEdit} className="modal-form">
                            <div className="form-group">
                                <label>Titre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Catégorie</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Extrait</label>
                                <textarea
                                    rows="2"
                                    className="form-control"
                                    value={editForm.excerpt}
                                    onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Contenu de l'article</label>
                                <textarea
                                    rows="8"
                                    className="form-control"
                                    value={editForm.content}
                                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsQuickEditOpen(false)} className="btn btn-outline">Annuler</button>
                                <button type="submit" className="btn btn-primary"><CheckCircle2 size={18} /> Enregistrer les modifications</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogDetailPage;
