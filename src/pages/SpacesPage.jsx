import React from 'react';
import { motion } from 'framer-motion';
import content from '../data/content.json';

import '../styles/SpacesPage.css';

const SpacesPage = () => {
    const { spaces } = content;

    return (
        <div className="spaces-page">
            <section className="page-header bg-dark">
                <div className="container text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Infrastructures & Équipements
                    </motion.h1>
                    <p className="subtitle text-white">L'excellence technique au service de la culture</p>
                </div>
            </section>

            <section className="spaces-detailed-section">
                <div className="container">
                    <div className="spaces-list">
                        {spaces.map((space, index) => (
                            <motion.div
                                key={space.id}
                                className={`detailed-space-item ${index % 2 !== 0 ? 'reverse' : ''}`}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <div className="slide-image-container">
                                    <img src={space.image} alt={space.title} />
                                    <div className="image-overlay-institutional"></div>
                                </div>
                                <div className="slide-content-institutional">
                                    <span className="section-tag">Équipement Professionnel</span>
                                    <h2>{space.title}</h2>
                                    <p className="narrative-text">{space.description}</p>

                                    <div className="technical-specs">
                                        <div className="spec-item">
                                            <span className="spec-label">Disponibilité</span>
                                            <span className="spec-value">à la demande</span>
                                        </div>
                                    </div>

                                    <div className="slide-actions">
                                        <button className="btn btn-secondary">Fiche Technique PDF</button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section-padding bg-sand">
                <div className="container text-center">
                    <h2 className="section-title">Organisation d'événements</h2>
                    <p className="max-width-700 mx-auto">
                        Le Centre Culturel Les Bambous Idrissa Koné accompagne les institutions,
                        les ONG et les artistes dans l'organisation de leurs événements majeurs(Diner , dedicace, conférènce de presse,...).
                        Profitez de notre expertise.
                    </p>
                    <div className="cta-group mt-4">
                        <button className="btn btn-primary">Nous contacter pour un devis</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SpacesPage;
