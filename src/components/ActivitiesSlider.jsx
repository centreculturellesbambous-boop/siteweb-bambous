import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Sparkles, Tag } from 'lucide-react';
import EditableText from './EditableText';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/ActivitiesSlider.css';

const DEFAULT_ACTIVITIES = [
    {
        id: 'cours-de-danse',
        title: 'Cours de Danse',
        category: 'Danse',
        dates: 'Tous les Mercredis de 18h à 20h',
        statusBadge: 'HEBDOMADAIRE',
        image: '/images/cours-de-danse.jpg',
        description: 'Cours de danse africaine, contemporaine et traditionnelle ouverts à tous les niveaux.'
    },
    {
        id: 'camp-vacances-2026',
        title: 'Camp Vacances Culture 2026',
        category: 'Camps Vacances Culture',
        dates: '20 Juillet — 15 Août 2026',
        statusBadge: 'JEUNESSE',
        image: '/images/cvc2026.jpeg',
        description: 'Grand rendez-vous éducatif et artistique pour les enfants : Musique, Chant, Danse, Peinture, Slam et Conte.'
    },
    {
        id: 'cours-de-musique',
        title: 'Cours de Musique & Percussions',
        category: 'Musique',
        dates: 'Cours hebdomadaires',
        statusBadge: 'PERMANENT',
        image: '/images/formation.jpeg',
        description: 'Apprentissage d\'instruments traditionnels et modernes : balafon, kora, djembe, guitare et percussions.'
    },
    {
        id: 'residences-de-creation',
        title: 'Résidences de Création',
        category: 'Résidence',
        dates: 'Sessions de 2 à 4 semaines',
        statusBadge: 'PROMOTION',
        image: '/images/st-residence.jpg',
        description: 'Accompagnement et accueil d\'artistes en résidence pour développer et concrétiser leurs créations.'
    },
    {
        id: 'cafe-concert-jam',
        title: 'Café-Concert & Jam Sessions',
        category: 'Concert Live',
        dates: 'Tous les Vendredis Soir (Dès 20h30)',
        statusBadge: 'HEBDOMADAIRE',
        image: '/images/live.jpg',
        description: 'Scène ouverte, prestations live et moments d\'échanges conviviaux sur la terrasse du Centre.'
    },
    {
        id: 'concerts-live-grande-scene',
        title: 'Concerts Live — Grande Scène',
        category: 'Concert Live',
        dates: 'Tous les Samedis Soir (Dès 21h00)',
        statusBadge: 'HEBDOMADAIRE',
        image: '/images/scene.jpg',
        description: 'Grands concerts live et performances sur la Grande Scène Victor Dème.'
    },
    {
        id: 'ateliers-peinture',
        title: 'Ateliers de Peinture',
        category: 'Arts Plastiques',
        dates: 'Ateliers de vacances',
        statusBadge: 'ATELIER',
        image: '/images/arts plastique.jpeg',
        description: 'Explorez les arts plastiques à travers des ateliers de peinture alliant techniques modernes et inspirations africaines.'
    }
];

const ActivitiesSlider = ({ activities = DEFAULT_ACTIVITIES }) => {
    const list = activities && activities.length > 0 ? activities : DEFAULT_ACTIVITIES;

    return (
        <div className="activities-slider-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                autoplay={{ delay: 4500, disableOnInteraction: false }}
                breakpoints={{
                    640: { slidesPerView: 1.5 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                }}
                navigation
                pagination={{ clickable: true }}
                className="activities-swiper"
            >
                {list.map((act, index) => (
                    <SwiperSlide key={act.id || index}>
                        <motion.div
                            className="activity-card-carousel"
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="activity-card-banner">
                                <EditableText
                                    fieldPath={`activities.${index}.image`}
                                    value={act.image}
                                    type="image"
                                    label={`Photo ${act.title}`}
                                >
                                    <img src={act.image} alt={act.title} className="activity-card-img" />
                                </EditableText>
                                <div className="activity-badge-date">
                                    <Calendar size={13} />
                                    <EditableText
                                        fieldPath={`activities.${index}.dates`}
                                        value={act.dates}
                                        label="Dates / Sessions"
                                    >
                                        <span>{act.dates}</span>
                                    </EditableText>
                                </div>
                                {act.statusBadge && (
                                    <EditableText
                                        fieldPath={`activities.${index}.statusBadge`}
                                        value={act.statusBadge}
                                        label="Badge Statut (ex: PROMOTION)"
                                    >
                                        <span className="activity-status-pill">{act.statusBadge}</span>
                                    </EditableText>
                                )}
                            </div>

                            <div className="activity-card-body">
                                <span className="activity-category-tag">
                                    <Tag size={12} />
                                    <EditableText
                                        fieldPath={`activities.${index}.category`}
                                        value={act.category}
                                        label="Catégorie"
                                    >
                                        <span>{act.category}</span>
                                    </EditableText>
                                </span>

                                <h3 className="activity-card-title">
                                    <EditableText
                                        fieldPath={`activities.${index}.title`}
                                        value={act.title}
                                        label="Titre Activité"
                                    />
                                </h3>

                                <p className="activity-card-desc">
                                    <EditableText
                                        fieldPath={`activities.${index}.description`}
                                        value={act.description}
                                        type="textarea"
                                        label="Description Activité"
                                    />
                                </p>

                                <div className="activity-card-footer">
                                    <Link to="/activites" className="btn-activity-link">
                                        Découvrir l'activité <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ActivitiesSlider;
