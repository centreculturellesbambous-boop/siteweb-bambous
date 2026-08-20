import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeToContent } from '../lib/contentService';
import EditableText from '../components/EditableText';
import initialContent from '../data/content.json';
import '../styles/CentrePage.css';

const CentrePage = () => {
    const [siteContent, setSiteContent] = useState(initialContent);

    useEffect(() => {
        const unsub = subscribeToContent(({ content }) => {
            setSiteContent(content);
        });
        return () => unsub();
    }, []);

    const { about = initialContent.about, partners = initialContent.partners } = siteContent;

    return (
        <div className="centre-page">
            {/* 1. Introduction – The Cultural Center */}
            <section className="page-header bg-dark">
                <div className="container text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <EditableText
                            fieldPath="about.intro.title"
                            value={about.intro?.title}
                            label="Titre d'Introduction"
                        />
                    </motion.h1>
                    <div className="subtitle text-white">
                        <EditableText
                            fieldPath="about.intro.content"
                            value={about.intro?.content}
                            type="textarea"
                            label="Texte d'Introduction"
                        />
                    </div>
                </div>
            </section>

            {/* 3. Major Events & Highlights */}
            <section className="section-padding highlights-section">
                <div className="container">
                    <div className="text-center mb-4">
                        <h2 className="section-title">Événements Majeurs</h2>
                        <p className="subtitle mx-auto max-width-700">Découvrez les piliers de notre programmation culturelle et artistique.</p>
                    </div>
                    <div className="grid-4 highlights-grid">
                        {(about.highlights || []).map((item, index) => (
                            <motion.div
                                key={index}
                                className="highlight-card creative-border"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <h3>
                                    <EditableText
                                        fieldPath={`about.highlights.${index}.title`}
                                        value={item.title}
                                        label="Titre Piler"
                                    />
                                </h3>
                                <p>
                                    <EditableText
                                        fieldPath={`about.highlights.${index}.description`}
                                        value={item.description}
                                        type="textarea"
                                        label="Description Pilier"
                                    />
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. The Team */}
            <section className="section-padding bg-dark team-section">
                <div className="container">
                    <div className="text-center mb-4">
                        <h2 className="section-title text-white">Notre Équipe</h2>
                        <p className="subtitle text-white mx-auto max-width-700">Des professionnels passionnés au service du rayonnement culturel.</p>
                    </div>
                    <div className="grid-4 team-grid">
                        {(about.team || []).map((member, index) => (
                            <motion.div
                                key={index}
                                className="team-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="team-image-wrapper">
                                    <EditableText
                                        fieldPath={`about.team.${index}.image`}
                                        value={member.image}
                                        type="image"
                                        label={`Photo ${member.name}`}
                                    >
                                        <img src={member.image} alt={member.name} />
                                    </EditableText>
                                </div>
                                <div className="team-info">
                                    <h3>
                                        <EditableText
                                            fieldPath={`about.team.${index}.name`}
                                            value={member.name}
                                            label="Nom du membre"
                                        />
                                    </h3>
                                    <p className="team-role">
                                        <EditableText
                                            fieldPath={`about.team.${index}.role`}
                                            value={member.role}
                                            label="Poste / Rôle"
                                        />
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Partners & Supporters */}
            <section className="section-padding partners-section">
                <div className="container text-center">
                    <h2 className="section-title">Nos Partenaires</h2>
                    <p className="subtitle mx-auto max-width-700 mb-4">
                        Ces partenariats soutiennent les activités culturelles, les artistes et l'éducation pour tous.
                    </p>
                </div>

                <div className="partners-marquee-container">
                    <div className="partners-marquee-track">
                        {[...partners, ...partners].map((partner, index) => (
                            <div key={`${partner.id}-${index}`} className="partner-logo-box">
                                <img src={partner.logo} alt={partner.name} title={partner.name} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CentrePage;
