import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroSlider from '../components/HeroSlider';
import SpacesSlider from '../components/SpacesSlider';
import ActivitiesSlider from '../components/ActivitiesSlider';
import EventCard from '../components/EventCard';
import InlineAdminBar from '../components/InlineAdminBar';
import EditableText from '../components/EditableText';
import { subscribeToContent } from '../lib/contentService';
import initialContent from '../data/content.json';
import extraEvents from '../data/events.json';
import '../styles/HomePage.css';

// Calcule le statut réel selon la date du jour (identique à EventsPage)
const computeStatus = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today ? 'recent' : 'upcoming';
};

const loadAllEvents = (contentData) => {
    const baseEvents = contentData.events || [];
    const baseIds = new Set(baseEvents.map(e => String(e.id)));
    const newOnes = extraEvents.filter(e => !baseIds.has(String(e.id)));
    return [...baseEvents, ...newOnes];
};

const HomePage = () => {
    const [siteContent, setSiteContent] = useState(initialContent);

    useEffect(() => {
        const unsub = subscribeToContent(({ content }) => {
            setSiteContent(content);
        });
        return () => unsub();
    }, []);

    const { home, spaces } = siteContent;

    // Tous les événements avec statut recalculé dynamiquement
    const allEvents = useMemo(() =>
        loadAllEvents(siteContent).map(e => ({ ...e, status: computeStatus(e.date) })),
        [siteContent]);

    // À venir : du plus proche au plus lointain
    const upcomingEvents = useMemo(() =>
        allEvents
            .filter(e => e.status === 'upcoming')
            .sort((a, b) => new Date(a.date) - new Date(b.date)),
        [allEvents]);

    // Récents : du plus récent au plus ancien
    const recentEvents = useMemo(() =>
        allEvents
            .filter(e => e.status === 'recent')
            .sort((a, b) => new Date(b.date) - new Date(a.date)),
        [allEvents]);

    return (
        <div className="home-page">
            {/* Inline Admin Bar */}
            <InlineAdminBar />

            {/* 2. Hero Section */}
            <section className="hero-section">
                <HeroSlider slides={home.hero} />
            </section>

            {/* 3. Presentation & History - Two Column Layout */}
            <section className="section-padding presentation-section">
                <div className="container">
                    <div className="presentation-grid">
                        <motion.div
                            className="presentation-image"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <div className="img-frame">
                                <EditableText
                                    fieldPath="home.presentation.image"
                                    value={home.presentation.image}
                                    type="image"
                                    label="Photo Présentation du Centre"
                                >
                                    <img src={home.presentation.image} alt="Le Centre" />
                                </EditableText>
                            </div>
                        </motion.div>

                        <motion.div
                            className="presentation-text"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <span className="section-tag">PRESENTATION</span>
                            <h2 className="section-title-left">
                                <EditableText
                                    fieldPath="home.presentation.title"
                                    value={home.presentation.title}
                                    label="Titre Présentation"
                                />
                            </h2>
                            <div className="narrative-text">
                                <EditableText
                                    fieldPath="home.presentation.text"
                                    value={home.presentation.text}
                                    type="textarea"
                                    label="Texte de Présentation du Centre"
                                />
                            </div>
                            <p className="narrative-text mt-3">
                                Un lieu emblématique au cœur de la communauté, le Centre :
                                Dynamise la scène artistique locale • Révèle et accompagne de nouveaux talents • Forme la jeunesse à travers cours, ateliers et résidences.
                            </p>
                            <Link to="/centre" className="btn btn-primary">En savoir plus</Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3.5 Section Nos Activités & Ateliers (Carrousel Défilant Soft Theme) */}
            <section className="section-padding home-activities-section soft-theme">
                <div className="container">
                    <div className="text-center mb-4">
                        <span className="section-tag">Formations & Créativité</span>
                        <h2 className="section-title-soft">Nos Activités</h2>
                        <p className="subtitle-soft">
                            Découvrez les ateliers, cours, résidences et le <strong>Camp Vacances Culture 2026</strong> du Centre.
                        </p>
                    </div>

                    <ActivitiesSlider activities={siteContent.activities} />

                    <div className="text-center mt-3">
                        <Link to="/activites" className="btn btn-secondary">
                            Voir le programme complet des activités →
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. Spaces & Equipment Preview */}
            <section className="section-padding spaces-preview">
                <div className="container">
                    <div className="text-center mb-4">
                        <span className="section-tag-light">Nos Infrastructures</span>
                        <h2 className="section-title text-white">Espaces & Équipements</h2>
                    </div>

                    <div className="carousel-wrapper">
                        <SpacesSlider spaces={spaces} />
                    </div>

                    <div className="text-center mt-4">
                        <Link to="/espaces" className="btn btn-secondary">Voir tous les espaces</Link>
                    </div>
                </div>
            </section>

            {/* Événements à venir */}
            {upcomingEvents.length > 0 && (
                <section className="section-padding upcoming-events-section">
                    <div className="container">
                        <div className="text-center mb-4">
                            <span className="section-tag">À l'Affiche</span>
                            <h2 className="section-title">Événements à Venir</h2>
                        </div>

                        <div className="grid-3">
                            {upcomingEvents.slice(0, 3).map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>

                        <div className="text-center mt-4">
                            <Link to="/evenements" className="btn btn-primary">Voir toute la programmation</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Événements récents */}
            {recentEvents.length > 0 && (
                <section className="section-padding recent-events-section bg-sand">
                    <div className="container">
                        <div className="text-center mb-4">
                            <span className="section-tag">Mémoires</span>
                            <h2 className="section-title">Événements Récents</h2>
                        </div>

                        <div className="grid-3">
                            {recentEvents.slice(0, 3).map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>

                        <div className="text-center mt-4">
                            <Link to="/galerie" className="btn btn-secondary">Parcourir la galerie</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Programs Preview / Call to Action */}
            <section className="section-padding programs-preview">
                <div className="container">
                    <div className="cta-box">
                        <div className="cta-overlay"></div>
                        <div className="cta-content">
                            <h2>Soutenir la Création</h2>
                            <p>
                                Votre don contribue directement à la formation des jeunes, à l’accompagnement des artistes et à l’organisation d’activités culturelles accessibles à tous.
                                En soutenant le centre, vous participez à la préservation et à la transmission de la culture vivante.
                            </p>
                            <Link to="/soutien" className="btn btn-primary">Faire un Don / Soutenir</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
