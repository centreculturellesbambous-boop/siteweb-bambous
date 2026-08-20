import React from 'react';
import { motion } from 'framer-motion';
import { Handshake, Globe } from 'lucide-react';
import content from '../data/content.json';
import '../styles/PartnersPage.css';

const PartnersPage = () => {
    const { partners } = content;

    return (
        <div className="partners-page">
            <section className="page-header bg-dark">
                <div className="container text-center">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        Réseau de Partenaires
                    </motion.h1>
                    <p className="subtitle text-white">L'alliance des forces vives pour la culture Idrissa Koné</p>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div className="partners-institutional-grid">
                        {partners.map((partner, index) => (
                            <motion.div
                                key={partner.id}
                                className="partnership-card shadow-sm"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="p-logo-wrapper">
                                    <div className="p-accent-bar"></div>
                                    <img src={partner.logo} alt={partner.name} />
                                </div>
                                <div className="p-content">
                                    <h3>{partner.name}</h3>
                                    <p className="narrative-text">
                                        Institution partenaire engagée dans le développement des arts vivants
                                        et le soutien aux infrastructures du centre.
                                    </p>
                                    <a href="#" className="p-link">
                                        Voir l'engagement <Globe size={16} />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section-padding bg-sand">
                <div className="container">
                    <div className="institutional-box-accent">
                        <div className="box-icon"><Handshake size={48} /></div>
                        <div className="box-text">
                            <h2>Rejoignez notre réseau institutionnel</h2>
                            <p>
                                Devenir partenaire du Centre Culturel Les Bambous Idrissa Koné, c'est choisir
                                d'investir dans l'excellence artistique et l'avenir de la jeunesse burkinabè.
                            </p>
                            <div className="box-actions">
                                <button className="btn btn-primary">Formulaire de Partenariat</button>
                                <button className="btn btn-secondary">Mécénat & Dons</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PartnersPage;
