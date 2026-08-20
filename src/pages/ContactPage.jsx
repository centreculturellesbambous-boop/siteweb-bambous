import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, Facebook, Instagram, Youtube, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import InlineAdminBar from '../components/InlineAdminBar';
import EditableText from '../components/EditableText';
import { subscribeToContent } from '../lib/contentService';
import initialContent from '../data/content.json';
import '../styles/ContactPage.css';

// ⚠️ Remplacez VOTRE_FORM_ID par l'ID obtenu sur formspree.io
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/VOTRE_FORM_ID';

const ContactPage = () => {
    const [siteContent, setSiteContent] = useState(initialContent);
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    useEffect(() => {
        const unsub = subscribeToContent(({ content }) => {
            setSiteContent(content);
        });
        return () => unsub();
    }, []);

    const { siteMetadata } = siteContent;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <div className="contact-page">
            <InlineAdminBar />
            <section className="page-header bg-dark">
                <div className="container text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Contactez l'Institution
                    </motion.h1>
                    <p className="subtitle text-white">Nos équipes sont à votre écoute pour tout projet ou information</p>
                </div>
            </section>

            <section className="section-padding">
                <div className="container">
                    <div className="contact-institutional-grid">
                        {/* Contact Form */}
                        <motion.div
                            className="contact-form-card shadow-card"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2>Formulaire de Contact</h2>
                            <form onSubmit={handleSubmit} className="institutional-form">
                                <div className="input-group">
                                    <label>Nom complet</label>
                                    <input type="text" name="name" required placeholder="Votre nom" value={formData.name} onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Adresse e-mail</label>
                                    <input type="email" name="email" required placeholder="votre.email@exemple.com" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label>Objet de votre demande</label>
                                    <select name="subject" value={formData.subject} onChange={handleChange}>
                                        <option value="general">Information générale</option>
                                        <option value="residence">Résidence d'artiste</option>
                                        <option value="location">Location d'espace</option>
                                        <option value="press">Presse & Médias</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Message</label>
                                    <textarea name="message" rows="6" required placeholder="Détaillez votre requête..." value={formData.message} onChange={handleChange}></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary full-width" disabled={status === 'loading'}>
                                    {status === 'loading' ? <><Loader size={18} className="spin" /> Envoi en cours...</> : <>Envoyer la requête <Send size={18} /></>}
                                </button>
                                {status === 'success' && (
                                    <div className="form-feedback success">
                                        <CheckCircle size={20} /> Message envoyé avec succès ! Nous vous répondrons prochainement.
                                    </div>
                                )}
                                {status === 'error' && (
                                    <div className="form-feedback error">
                                        <AlertCircle size={20} /> Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.
                                    </div>
                                )}
                            </form>
                        </motion.div>

                        {/* Info and Map */}
                        <motion.div
                            className="contact-info-sidebar"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="info-block">
                                <h3>Coordonnées de l'Institution</h3>
                                <ul className="details-list">
                                    <li>
                                        <MapPin className="icon-blue" />
                                        <EditableText
                                            fieldPath="siteMetadata.contact.address"
                                            value={siteMetadata.contact.address}
                                            label="Adresse physique du Centre"
                                        />
                                    </li>
                                    <li>
                                        <Phone className="icon-blue" />
                                        <EditableText
                                            fieldPath="siteMetadata.contact.phone"
                                            value={siteMetadata.contact.phone}
                                            label="Numéros de Téléphone"
                                        />
                                    </li>
                                    <li>
                                        <Mail className="icon-blue" />
                                        <EditableText
                                            fieldPath="siteMetadata.contact.email"
                                            value={siteMetadata.contact.email}
                                            label="Adresse Email officielle"
                                        />
                                    </li>
                                </ul>
                            </div>

                            <div className="info-block">
                                <h3>Suivez nos actualités</h3>
                                <div className="social-grid">
                                    <a href={siteMetadata.contact.socials.facebook} className="social-tile fb"><Facebook /></a>
                                    <a href={siteMetadata.contact.socials.instagram} className="social-tile ig"><Instagram /></a>
                                    <a href={siteMetadata.contact.socials.youtube} className="social-tile yt"><Youtube /></a>
                                </div>
                            </div>

                            <div className="institutional-map">
                                <div className="map-inner">
                                    <p>Fondation Idrissa Koné</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
