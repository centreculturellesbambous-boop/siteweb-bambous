import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeToContent } from '../lib/contentService';
import EditableText from '../components/EditableText';
import initialContent from '../data/content.json';
import '../styles/SpacesPage.css';

const SpacesPage = () => {
    const [siteContent, setSiteContent] = useState(initialContent);

    useEffect(() => {
        const unsub = subscribeToContent(({ content }) => {
            setSiteContent(content);
        });
        return () => unsub();
    }, []);

    const { spaces = initialContent.spaces } = siteContent;

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
                                key={space.id || index}
                                className={`detailed-space-item ${index % 2 !== 0 ? 'reverse' : ''}`}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <div className="slide-image-container">
                                    <EditableText
                                        fieldPath={`spaces.${index}.image`}
                                        value={space.image}
                                        type="image"
                                        label={`Photo ${space.title}`}
                                    >
                                        <img src={space.image} alt={space.title} />
                                    </EditableText>
                                    <div className="image-overlay-institutional"></div>
                                </div>
                                <div className="slide-content-institutional">
                                    <span className="section-tag">Équipement Professionnel</span>
                                    <h2>
                                        <EditableText
                                            fieldPath={`spaces.${index}.title`}
                                            value={space.title}
                                            label="Titre Espace"
                                        />
                                    </h2>
                                    <p className="narrative-text">
                                        <EditableText
                                            fieldPath={`spaces.${index}.description`}
                                            value={space.description}
                                            type="textarea"
                                            label="Description Espace"
                                        />
                                    </p>

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
