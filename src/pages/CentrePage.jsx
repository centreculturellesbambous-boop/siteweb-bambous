import React from 'react';
import { motion } from 'framer-motion';
import content from '../data/content.json';
import '../styles/CentrePage.css';

const CentrePage = () => {
    const { about, partners } = content;

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
                        {about.intro.title}
                    </motion.h1>
                    <p className="subtitle text-white">{about.intro.content}</p>
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
                        {about.highlights.map((item, index) => (
                            <motion.div
                                key={index}
                                className="highlight-card creative-border"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
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
                        {about.team.map((member, index) => (
                            <motion.div
                                key={index}
                                className="team-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="team-image-wrapper">
                                    <img src={member.image} alt={member.name} />
                                </div>
                                <div className="team-info">
                                    <h3>{member.name}</h3>
                                    <p className="team-role">{member.role}</p>
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
                        {/* Duplicate the array to create an infinite loop */}
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
