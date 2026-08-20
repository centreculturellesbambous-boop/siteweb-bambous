import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Heart,
    Smartphone,
    CreditCard,
    ShieldCheck,
    Users,
    Palette,
    Music,
    Tent,
    CheckCircle2,
    Lock,
    ExternalLink
} from 'lucide-react';
import { subscribeToContent } from '../lib/contentService';
import EditableText from '../components/EditableText';
import initialContent from '../data/content.json';
import '../styles/SoutienPage.css';

const SoutienPage = () => {
    const [siteContent, setSiteContent] = useState(initialContent);

    useEffect(() => {
        const unsub = subscribeToContent(({ content }) => {
            setSiteContent(content);
        });
        return () => unsub();
    }, []);

    const { soutien = initialContent.soutien } = siteContent;

    return (
        <div className="soutien-page">
            {/* 1. Page Introduction */}
            <section className="page-header bg-dark">
                <div className="container text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Don & Soutien
                    </motion.h1>
                    <motion.p
                        className="subtitle text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        Soutenir la culture, c'est investir dans les artistes, l'éducation de la jeunesse et la transmission culturelle.
                    </motion.p>
                    <motion.div
                        className="anonymity-badge"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        <Lock size={16} /> Les dons peuvent être effectués de manière anonyme
                    </motion.div>
                </div>
            </section>

            {/* 2. Why Support the Center */}
            <section className="section-padding bg-light">
                <div className="container">
                    <div className="section-intro text-center mb-4">
                        <h2 className="section-title">Pourquoi nous soutenir ?</h2>
                        <p className="max-width-700 mx-auto">
                            Votre générosité est le moteur de notre action. Chaque don contribue directement à la vitalité culturelle de notre communauté.
                        </p>
                    </div>

                    <div className="grid-4 why-support-grid">
                        <div className="support-reason-card">
                            <Palette className="icon-primary" size={40} />
                            <h3>Soutenir les artistes</h3>
                            <p>Accompagner les créateurs locaux dans leur développement professionnel.</p>
                        </div>
                        <div className="support-reason-card">
                            <Music className="icon-primary" size={40} />
                            <h3>Animer la culture</h3>
                            <p>Organiser des événements, festivals et activités culturelles tout au long de l'année.</p>
                        </div>
                        <div className="support-reason-card">
                            <Users className="icon-primary" size={40} />
                            <h3>Éducation artistique</h3>
                            <p>Développer des programmes pédagogiques pour les jeunes générations.</p>
                        </div>
                        <div className="support-reason-card">
                            <Tent className="icon-primary" size={40} />
                            <h3>Camps de vacances</h3>
                            <p>Offrir des séjours créatifs et éducatifs aux enfants et adolescents.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Support for Artists & Cultural Activities */}
            <section className="section-padding">
                <div className="container">
                    <div className="columns-2 align-center">
                        <div className="content-block">
                            <h2 className="section-title">Soutien aux Artistes & Activités</h2>
                            <p>
                                Le Centre Culturel Les Bambous est un véritable foyer pour la création. Vos dons nous permettent d'améliorer constamment les conditions de travail des artistes :
                            </p>
                            <ul className="feature-list">
                                <li><CheckCircle2 size={20} className="text-green" /> Amélioration des salles de répétition</li>
                                <li><CheckCircle2 size={20} className="text-green" /> Aide à la création artistique originale</li>
                                <li><CheckCircle2 size={20} className="text-green" /> Organisation d'ateliers et résidences</li>
                                <li><CheckCircle2 size={20} className="text-green" /> Accès facilité aux espaces de diffusion</li>
                            </ul>
                        </div>
                        <div className="image-block">
                            <EditableText
                                fieldPath="soutien.artists_image"
                                value={soutien.artists_image}
                                type="image"
                                label="Photo Section Artistes"
                            >
                                <img src={soutien.artists_image} alt="Artistes en résidence" className="rounded-shadow" />
                            </EditableText>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Cultural Holiday Camps */}
            <section className="section-padding bg-sand">
                <div className="container">
                    <div className="columns-2 align-center reverse-mobile">
                        <div className="image-block">
                            <EditableText
                                fieldPath="soutien.holiday_camps_image"
                                value={soutien.holiday_camps_image}
                                type="image"
                                label="Photo Section Camps de Vacances"
                            >
                                <img src={soutien.holiday_camps_image} alt="Camp de vacances culturel" className="rounded-shadow" />
                            </EditableText>
                        </div>
                        <div className="content-block">
                            <h2 className="section-title">Camps de Vacances Culturels</h2>
                            <p>
                                Chaque année, nous organisons des camps de vacances pour les enfants. Vos contributions essentielles permettent de :
                            </p>
                            <ul className="feature-list">
                                <li><CheckCircle2 size={20} className="text-green" /> Rendre les camps accessibles aux familles modestes</li>
                                <li><CheckCircle2 size={20} className="text-green" /> Fournir du matériel pédagogique de qualité</li>
                                <li><CheckCircle2 size={20} className="text-green" /> Assurer un encadrement professionnel sécurisé</li>
                                <li><CheckCircle2 size={20} className="text-green" /> Éveiller la curiosité artistique des plus jeunes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Donation Methods */}
            <section className="section-padding" id="don-methods">
                <div className="container">
                    <div className="section-intro text-center mb-4">
                        <h2 className="section-title">Comment faire un don ?</h2>
                        <p className="max-width-700 mx-auto">
                            Choisissez le moyen de paiement qui vous convient le mieux.
                            <strong> Les dons anonymes sont pleinement acceptés</strong> et aucune donnée personnelle n'est requise.
                        </p>
                    </div>

                    <div className="payment-methods-grid">
                        <div className="payment-card">
                            <Smartphone className="payment-icon orange" />
                            <h3>Orange Money</h3>
                            <p>Rapide et direct</p>
                        </div>
                        <div className="payment-card">
                            <Smartphone className="payment-icon wave" />
                            <h3>Wave</h3>
                            <p>Simple et sans frais</p>
                        </div>
                        <div className="payment-card">
                            <Smartphone className="payment-icon moov" />
                            <h3>Moov Money</h3>
                            <p>Options flexibles</p>
                        </div>
                        <div className="payment-card">
                            <CreditCard className="payment-icon bank" />
                            <h3>Virement Bancaire</h3>
                            <p>Pour les dons importants</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Bank Transfer Information Section */}
            <section className="section-padding bg-light-green">
                <div className="container">
                    <div className="bank-info-block">
                        <div className="bank-info-header">
                            <ShieldCheck className="text-blue" size={32} />
                            <h2>Informations pour Virement Bancaire</h2>
                        </div>
                        <div className="bank-details-grid">
                            <div className="detail-item">
                                <label>Titulaire du compte</label>
                                <span>Centre Culturel Les Bambous Idrissa Koné</span>
                            </div>
                            <div className="detail-item">
                                <label>Nom de la banque</label>
                                <span>[Nom de la banque]</span>
                            </div>
                            <div className="detail-item">
                                <label>Numéro de compte / IBAN</label>
                                <span>[FRXX XXXX XXXX XXXX XXXX XXXX XXX]</span>
                            </div>
                            <div className="detail-item">
                                <label>SWIFT / BIC</label>
                                <span>[XXXXXXXX]</span>
                            </div>
                            <div className="detail-item">
                                <label>Motif du virement</label>
                                <span>Don – Soutien culturel (optionnel)</span>
                            </div>
                        </div>
                        <p className="bank-note">
                            * Les donateurs anonymes peuvent omettre leur nom dans les détails du virement.
                        </p>
                    </div>
                </div>
            </section>

            {/* 7. Security & Transparency */}
            <section className="section-padding">
                <div className="container text-center">
                    <div className="transparency-block">
                        <ShieldCheck size={48} className="icon-secondary mb-2" />
                        <h2 className="section-title">Sécurité & Transparence</h2>
                        <div className="grid-2 transparency-grid">
                            <div className="transparency-item">
                                <h3>Gestion Responsable</h3>
                                <p>Vos dons sont gérés avec la plus grande rigueur et intégrité.</p>
                            </div>
                            <div className="transparency-item">
                                <h3>Usage Exclusif</h3>
                                <p>100% des fonds sont alloués à nos missions culturelles et éducatives.</p>
                            </div>
                            <div className="transparency-item">
                                <h3>Redevabilité</h3>
                                <p>La transparence financière est au cœur de nos valeurs institutionnelles.</p>
                            </div>
                            <div className="transparency-item">
                                <h3>Accès aux données</h3>
                                <p>Les rapports financiers peuvent être partagés avec nos partenaires sur demande.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. Call To Action */}
            <section className="cta-section section-padding bg-dark">
                <div className="container text-center">
                    <Heart className="heart-icon-pulse" size={64} />
                    <h2 className="text-white mb-2">Soutenir la culture aujourd’hui</h2>
                    <p className="text-white subtitle mb-4">Votre geste fait la différence pour l'avenir de nos artistes et de nos enfants.</p>
                    <div className="cta-buttons">
                        <button className="btn btn-secondary btn-lg">Faire un don</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SoutienPage;
