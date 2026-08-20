import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { subscribeToContent } from '../lib/contentService';
import EditableText from './EditableText';
import initialContent from '../data/content.json';
import '../styles/Footer.css';

const Footer = () => {
    const [siteContent, setSiteContent] = useState(initialContent);

    useEffect(() => {
        const unsub = subscribeToContent(({ content }) => {
            setSiteContent(content);
        });
        return () => unsub();
    }, []);

    const { siteMetadata } = siteContent;

    return (
        <footer className="footer bg-dark">
            <div className="container footer-content">
                <div className="footer-section">
                    <div className="footer-logo">
                        <div className="logo-circle-small">
                            <img src={siteMetadata.logo} alt="Logo" className="logo-image" />
                        </div>
                        <div className="footer-logo-text">
                            <h3>CENTRE CULTUREL LES BAMBOUS</h3>
                            <p className="footer-sub">Idrissa Koné</p>
                        </div>
                    </div>
                    <p className="footer-description">
                        Ensemble pour la promotion de la culture.
                    </p>
                    <div className="social-links">
                        <a href={siteMetadata.contact.socials.facebook} target="_blank" rel="noopener noreferrer"><Facebook /></a>
                        <a href={siteMetadata.contact.socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram /></a>
                        <a href={siteMetadata.contact.socials.youtube} target="_blank" rel="noopener noreferrer"><Youtube /></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Navigation</h4>
                    <ul className="footer-links">
                        <li><Link to="/centre">À propos</Link></li>
                        <li><Link to="/espaces">Espaces</Link></li>
                        <li><Link to="/activites">Activités</Link></li>
                        <li><Link to="/blog">Blog & Actualités</Link></li>
                        <li><Link to="/soutien">Soutenir</Link></li>
                        <li><Link to="/admin">Espace Administration</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Contact</h4>
                    <ul className="footer-contact-list">
                        <li>
                            <MapPin size={18} />
                            <EditableText
                                fieldPath="siteMetadata.contact.address"
                                value={siteMetadata.contact.address}
                                label="Adresse Physique"
                            >
                                <span>{siteMetadata.contact.address}</span>
                            </EditableText>
                        </li>
                        <li>
                            <Phone size={18} />
                            <EditableText
                                fieldPath="siteMetadata.contact.phone"
                                value={siteMetadata.contact.phone}
                                label="Téléphone(s)"
                            >
                                <span>{siteMetadata.contact.phone}</span>
                            </EditableText>
                        </li>
                        <li>
                            <Mail size={18} />
                            <EditableText
                                fieldPath="siteMetadata.contact.email"
                                value={siteMetadata.contact.email}
                                label="Email Officiel"
                            >
                                <span>{siteMetadata.contact.email}</span>
                            </EditableText>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Centre Culturel Les Bambous Idrissa Koné. Tous droits réservés.</p>
            </div>
        </footer>
    );
};

export default Footer;
