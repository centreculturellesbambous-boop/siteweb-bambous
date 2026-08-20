import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Tag, ArrowRight, Search } from 'lucide-react';
import { subscribeToArticles } from '../lib/blogService';
import initialArticles from '../data/blog.json';
import '../styles/BlogPage.css';

const BlogPage = () => {
    const [articles, setArticles] = useState(initialArticles);
    const [search, setSearch] = useState('');
    const [cat, setCat] = useState('Tous');

    useEffect(() => {
        const unsub = subscribeToArticles(({ articles }) => {
            setArticles(articles);
        });
        return () => unsub();
    }, []);

    const visibleArticles = articles.filter(a => a.status !== 'draft');

    const categories = ['Tous', ...Array.from(new Set(visibleArticles.map(a => a.category)))];

    const filtered = visibleArticles
        .filter(a => cat === 'Tous' || a.category === cat)
        .filter(a =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            (a.excerpt && a.excerpt.toLowerCase().includes(search.toLowerCase()))
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const [featured, ...rest] = filtered;

    return (
        <div className="blog-page">

            {/* ── Header ── */}
            <section className="blog-header bg-dark">
                <div className="container text-center">
                    <motion.span
                        className="blog-header-tag"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Actualités
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        La Vie du Centre
                    </motion.h1>
                    <motion.p
                        className="blog-header-sub"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Coulisses, événements, témoignages et actualités du Centre Culturel Les Bambous Idrissa Koné
                    </motion.p>
                </div>
            </section>

            {/* ── Filtres ── */}
            <section className="blog-filters-section">
                <div className="container blog-filters-bar">
                    {/* Recherche */}
                    <div className="blog-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un article..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Catégories */}
                    <div className="blog-cats">
                        {categories.map(c => (
                            <button
                                key={c}
                                className={`blog-cat-btn ${cat === c ? 'active' : ''}`}
                                onClick={() => setCat(c)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">

                    {filtered.length === 0 ? (
                        <div className="blog-empty">
                            <p>Aucun article trouvé.</p>
                            <button className="btn btn-secondary" onClick={() => { setSearch(''); setCat('Tous'); }}>
                                Réinitialiser
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* ── Article à la une ── */}
                            {featured && (
                                <motion.div
                                    className="blog-featured"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Link to={`/blog/${featured.id}`} className="blog-featured-img-link">
                                        <img src={featured.coverImage} alt={featured.title} />
                                        <span className="blog-featured-badge">À la une</span>
                                    </Link>
                                    <div className="blog-featured-body">
                                        <span className="blog-cat-pill">{featured.category}</span>
                                        <h2 className="blog-featured-title">
                                            <Link to={`/blog/${featured.id}`}>{featured.title}</Link>
                                        </h2>
                                        <p className="blog-featured-excerpt">{featured.excerpt}</p>
                                        <div className="blog-meta">
                                            <span><User size={14} /> {featured.author}</span>
                                            <span><Calendar size={14} />
                                                {new Date(featured.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <Link to={`/blog/${featured.id}`} className="blog-read-more">
                                            Lire l'article <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Grille des autres articles ── */}
                            {rest.length > 0 && (
                                <div className="blog-grid">
                                    {rest.map((article, i) => (
                                        <motion.article
                                            key={article.id}
                                            className="blog-card"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                        >
                                            <Link to={`/blog/${article.id}`} className="blog-card-img-link">
                                                <img src={article.coverImage} alt={article.title} />
                                                <span className="blog-cat-pill blog-cat-pill--overlay">{article.category}</span>
                                            </Link>
                                            <div className="blog-card-body">
                                                <h3 className="blog-card-title">
                                                    <Link to={`/blog/${article.id}`}>{article.title}</Link>
                                                </h3>
                                                <p className="blog-card-excerpt">{article.excerpt}</p>
                                                <div className="blog-meta">
                                                    <span><Calendar size={13} />
                                                        {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span><User size={13} /> {article.author}</span>
                                                </div>
                                                <Link to={`/blog/${article.id}`} className="blog-read-more blog-read-more--sm">
                                                    Lire <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </motion.article>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default BlogPage;
