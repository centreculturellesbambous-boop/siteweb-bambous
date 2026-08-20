import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar as CalendarIcon, Clock } from 'lucide-react';
import EventCard from '../components/EventCard';
import content from '../data/content.json';
import extraEvents from '../data/events.json';
import '../styles/EventsPage.css';

// ─── Utilitaires ──────────────────────────────────────────────────────────────
const computeStatus = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today ? 'recent' : 'upcoming';
};

// Fusion content.json + events.json (sans doublon)
const baseIds = new Set(content.events.map(e => String(e.id)));
const ALL_EVENTS = [
    ...content.events,
    ...extraEvents.filter(e => !baseIds.has(String(e.id))),
].map(e => ({ ...e, status: computeStatus(e.date) }));

// ─── Composant principal ───────────────────────────────────────────────────────
const EventsPage = () => {
    const [filter, setFilter] = useState('Tous');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['Tous', 'CONCERT LIVE', 'Danse', 'Théâtre', 'Exposition', 'MODE', 'Ateliers', 'Cinéma', 'Résidence de Création', 'Tournée'];

    // ─── Filtres ──────────────────────────────────────────────────────────────
    const upcomingEvents = ALL_EVENTS
        .filter(e => e.status === 'upcoming')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const recentEvents = ALL_EVENTS
        .filter(e => e.status === 'recent')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const filterEvents = (list) => list.filter(e => {
        const matchesCategory = filter === 'Tous' || e.category === filter;
        const matchesSearch =
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const displayedUpcoming = filterEvents(upcomingEvents);
    const displayedRecent = filterEvents(recentEvents);
    const showUpcoming = statusFilter === 'Tous' || statusFilter === 'À venir';
    const showRecent = statusFilter === 'Tous' || statusFilter === 'Récents';

    return (
        <div className="events-page">

            {/* Header de page */}
            <section className="page-header bg-dark">
                <div className="container text-center">
                    <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        Programmation Idrissa Koné
                    </motion.h1>
                    <p className="subtitle text-white">Les rendez-vous incontournables de la scène burkinabè</p>
                </div>
            </section>

            {/* Contenu principal */}
            <section className="section-padding">
                <div className="container">
                    <div className="events-browser-institutional">

                        {/* Recherche */}
                        <div className="institutional-search">
                            <Search size={22} className="search-icon-blue" />
                            <input
                                type="text"
                                placeholder="Rechercher une programmation..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Catégories */}
                        <div className="institutional-category-tabs">
                            {categories.map(cat => (
                                <button key={cat}
                                    className={`tab-btn ${filter === cat ? 'active' : ''}`}
                                    onClick={() => setFilter(cat)}>
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Statuts */}
                        <div className="status-tabs">
                            {['Tous', 'À venir', 'Récents'].map(s => (
                                <button key={s}
                                    className={`status-tab-btn ${statusFilter === s ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(s)}>
                                    {s === 'À venir' && <CalendarIcon size={15} />}
                                    {s === 'Récents' && <Clock size={15} />}
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section À venir */}
                    {showUpcoming && (
                        <div className="events-section" id="events-section-main">
                            <div className="section-label upcoming-label">
                                <CalendarIcon size={18} />
                                <span>Prochains événements</span>
                                <span className="count-badge">{displayedUpcoming.length}</span>
                            </div>
                            <div className="events-grid-refined">
                                {displayedUpcoming.length > 0 ? (
                                    displayedUpcoming.map(event => <EventCard key={event.id} event={event} />)
                                ) : (
                                    <motion.div className="no-events-institutional" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <p>Aucun événement à venir pour le moment.</p>
                                        <button className="btn btn-secondary" onClick={() => { setFilter('Tous'); setSearchQuery(''); }}>Réinitialiser</button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Section Récents */}
                    {showRecent && (
                        <div className="events-section" style={{ marginTop: showUpcoming ? '5rem' : 0 }}>
                            <div className="section-label recent-label">
                                <Clock size={18} />
                                <span>Événements récents</span>
                                <span className="count-badge">{displayedRecent.length}</span>
                            </div>
                            <div className="events-grid-refined">
                                {displayedRecent.length > 0 ? (
                                    displayedRecent.map(event => <EventCard key={event.id} event={event} />)
                                ) : (
                                    <motion.div className="no-events-institutional" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <p>Aucun événement récent à afficher.</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter */}
            <section className="section-padding bg-sand">
                <div className="container">
                    <div className="institutional-cta-wide">
                        <div className="cta-icon-wrapper"><CalendarIcon size={40} /></div>
                        <div className="cta-text">
                            <h2>Abonnez-vous à notre newsletter culturelle</h2>
                            <p>Recevez chaque mois le programme complet et les invitations aux vernissages.</p>
                        </div>
                        <div className="cta-action">
                            <form className="newsletter-form-refined" onSubmit={e => e.preventDefault()}>
                                <input type="email" placeholder="votre@email.BF" required />
                                <button type="submit" className="btn btn-primary">S'abonner</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EventsPage;
