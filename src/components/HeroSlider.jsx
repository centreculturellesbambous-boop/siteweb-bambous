import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import EditableText from './EditableText';
import { useEditMode } from '../context/useEditMode';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import '../styles/HeroSlider.css';

const HeroSlider = ({ slides }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const { isVisualEditMode } = useEditMode();

    return (
        <div className="hero-slider">
            {isVisualEditMode && (
                <div style={{
                    position: 'absolute',
                    top: 15,
                    right: 20,
                    zIndex: 100,
                    background: 'rgba(147, 51, 234, 0.85)',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    ⏸️ Défilement automatique figé (Mode Édition)
                </div>
            )}
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                speed={1500}
                autoplay={isVisualEditMode ? false : {
                    delay: 10000,
                    disableOnInteraction: false,
                }}
                navigation
                pagination={{ clickable: true }}
                loop={true}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                className="hero-swiper"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={slide.id}>
                        <div className="hero-slide-content" style={{ backgroundImage: `url(${slide.image})` }}>
                            {/* MANDATORY: Dark overlay for readability */}
                            <div className="hero-overlay"></div>

                            {/* Camera button for background image */}
                            <div className="hero-bg-edit-box" style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                                <EditableText
                                    fieldPath={`home.hero.${index}.image`}
                                    value={slide.image}
                                    type="image"
                                    label={`Photo d'arrière-plan Diapositive ${index + 1}`}
                                />
                            </div>

                            <div className="container hero-text-container">
                                <AnimatePresence mode="wait">
                                    {activeIndex === index && (
                                        <motion.div
                                            key={slide.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="hero-text"
                                        >
                                            <h1 className="hero-title">
                                                <EditableText
                                                    fieldPath={`home.hero.${index}.title`}
                                                    value={slide.title}
                                                    label={`Titre Diapositive ${index + 1}`}
                                                />
                                            </h1>
                                            <p className="hero-subtitle">
                                                <EditableText
                                                    fieldPath={`home.hero.${index}.description`}
                                                    value={slide.description}
                                                    type="textarea"
                                                    label={`Texte Diapositive ${index + 1}`}
                                                />
                                            </p>
                                            <div className="hero-actions">
                                                <Link to="/centre" className="btn btn-primary">
                                                    Découvrir le Centre
                                                </Link>
                                                <Link to="/contact" className="btn btn-secondary">
                                                    Nous Contacter
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default HeroSlider;
