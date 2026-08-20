import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Palette, Home, Sun, Music, Clock, Users, CheckCircle, X, MessageCircle, Mail } from 'lucide-react';
import content from '../data/content.json';
import '../styles/ActivitiesPage.css';

const icons = [Music2, Palette, Home, Sun, Music];

// Infos de contact extraites du JSON
const { email, phone } = content.siteMetadata.contact;
// Deuxième numéro = WhatsApp (+226 72 48 32 21)
const whatsappNumber = phone.split('/')[1].replace(/\s+/g, '').replace('+', '');

const ProgramsPage = () => {
    const { programs } = content;

    // État du modal d'inscription
    const [selectedProg, setSelectedProg] = useState(null);

    const openModal = (prog) => setSelectedProg(prog);
    const closeModal = () => setSelectedProg(null);

    // Liens de contact avec message pré-rempli
    const getWhatsAppLink = (title) => {
        const msg = encodeURIComponent(
            `Bonjour, je souhaite m'inscrire au programme : *${title}* du Centre Culturel Les Bambous Idrissa Koné. Merci de me donner plus d'informations.`
        );
        return `https://wa.me/${whatsappNumber}?text=${msg}`;
    };

    const getEmailLink = (title) => {
        const subject = encodeURIComponent(`Inscription – ${title}`);
        const body = encodeURIComponent(
            `Bonjour,\n\nJe souhaite m'inscrire au programme : ${title}\ndu Centre Culturel Les Bambous Idrissa Koné.\n\nMerci de me contacter pour plus d'informations.\n\nCordialement.`
        );
        return `mailto:${email}?subject=${subject}&body=${body}`;
    };

    return (
        <div className="programs-page">
            {/* En-tête */}
            <section className="page-header bg-dark">
                <div className="container text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Nos Formations
                    </motion.h1>
                    <p className="subtitle text-white">
                        Des ateliers et programmes pour tous les âges, au cœur de la culture burkinabè
                    </p>
                </div>
            </section>

            {/* Grille des formations */}
            <section className="section-padding">
                <div className="container">
                    <div className="programs-grid">
                        {programs.map((prog, index) => {
                            const Icon = icons[index] || Music2;
                            return (
                                <motion.div
                                    key={prog.id}
                                    className="program-card"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                >
                                    <div className="program-image-container">
                                        <img src={prog.image} alt={prog.title} loading="lazy" />
                                        <div className="program-overlay-readability"></div>

                                        {/* Icône */}
                                        <div className="program-icon-badge">
                                            <Icon size={20} />
                                        </div>

                                        {/* Contenu texte */}
                                        <div className="program-content-overlay">
                                            <h3>{prog.title}</h3>
                                            <p>{prog.description}</p>

                                            {/* Badges */}
                                            {(prog.duree || prog.niveau || prog.places) && (
                                                <div className="program-meta-badges">
                                                    {prog.duree && (
                                                        <span className="meta-badge">
                                                            <Clock size={12} />
                                                            {prog.duree}
                                                        </span>
                                                    )}
                                                    {prog.niveau && (
                                                        <span className="meta-badge">
                                                            <Users size={12} />
                                                            {prog.niveau}
                                                        </span>
                                                    )}
                                                    {prog.places && (
                                                        <span className={`meta-badge places-badge ${prog.places === 'Sur candidature' ? 'candidature' : 'ouvertes'}`}>
                                                            <CheckCircle size={12} />
                                                            Places : {prog.places}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Bouton qui ouvre le modal */}
                                            <button
                                                className="btn-program-cta"
                                                onClick={() => openModal(prog)}
                                            >
                                                S'inscrire →
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA bas de page */}
            <section className="section-padding bg-sand">
                <div className="container text-center">
                    <motion.div
                        className="programs-cta-box"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Rejoignez nos programmes</h2>
                        <p>
                            Que vous soyez enfant, adolescent ou adulte, artiste débutant ou confirmé —
                            nos formations sont conçues pour révéler votre potentiel créatif.
                        </p>
                        <div className="cta-buttons">
                            <a
                                href={getWhatsAppLink('une formation')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-whatsapp"
                            >
                                <MessageCircle size={18} />
                                Nous contacter sur WhatsApp
                            </a>
                            <a
                                href={getEmailLink('une formation')}
                                className="btn btn-primary"
                            >
                                <Mail size={18} />
                                Envoyer un email
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ MODAL D'INSCRIPTION ═══ */}
            <AnimatePresence>
                {selectedProg && (
                    <motion.div
                        className="inscription-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.div
                            className="inscription-modal"
                            initial={{ opacity: 0, y: 60, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 60, scale: 0.94 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Bouton fermer */}
                            <button className="modal-close-btn" onClick={closeModal} aria-label="Fermer">
                                <X size={22} />
                            </button>

                            {/* En-tête modal */}
                            <div className="inscription-modal-header">
                                <span className="inscription-tag">Inscription</span>
                                <h2>{selectedProg.title}</h2>
                                <p>Choisissez comment vous souhaitez nous contacter pour vous inscrire :</p>
                            </div>

                            {/* Deux boutons de contact */}
                            <div className="inscription-contact-options">
                                {/* WhatsApp */}
                                <a
                                    href={getWhatsAppLink(selectedProg.title)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-option-btn whatsapp-btn"
                                    onClick={closeModal}
                                >
                                    <div className="contact-option-icon">
                                        <MessageCircle size={28} />
                                    </div>
                                    <div className="contact-option-text">
                                        <strong>WhatsApp</strong>
                                        <span>+226 72 48 32 21</span>
                                    </div>
                                    <span className="contact-option-arrow">→</span>
                                </a>

                                {/* Email */}
                                <a
                                    href={getEmailLink(selectedProg.title)}
                                    className="contact-option-btn email-btn"
                                    onClick={closeModal}
                                >
                                    <div className="contact-option-icon">
                                        <Mail size={28} />
                                    </div>
                                    <div className="contact-option-text">
                                        <strong>Email</strong>
                                        <span>{email}</span>
                                    </div>
                                    <span className="contact-option-arrow">→</span>
                                </a>
                            </div>

                            <p className="inscription-note">
                                Le message sera pré-rempli avec le nom de la formation pour faciliter votre demande.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProgramsPage;
