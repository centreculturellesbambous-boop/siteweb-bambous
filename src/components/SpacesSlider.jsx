import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import EditableText from './EditableText';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/SpacesSlider.css';

const SpacesSlider = ({ spaces }) => {
    return (
        <div className="spaces-slider-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                breakpoints={{
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                }}
                navigation
                pagination={{ clickable: true }}
                className="spaces-swiper"
            >
                {spaces.map((space, index) => (
                    <SwiperSlide key={space.id}>
                        <motion.div
                            className="space-carousel-card"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="space-card-img">
                                <EditableText
                                    fieldPath={`spaces.${index}.image`}
                                    value={space.image}
                                    type="image"
                                    label={`Photo ${space.title}`}
                                >
                                    <img src={space.image} alt={space.title} />
                                </EditableText>
                                <div className="space-card-overlay"></div>
                                <div className="space-card-info">
                                    <h3>
                                        <EditableText
                                            fieldPath={`spaces.${index}.title`}
                                            value={space.title}
                                            label="Titre Espace"
                                        />
                                    </h3>
                                    <p>
                                        <EditableText
                                            fieldPath={`spaces.${index}.description`}
                                            value={space.description}
                                            type="textarea"
                                            label="Description Espace"
                                        />
                                    </p>
                                    <Link to={`/espaces#${space.id}`} className="btn-text">
                                        En savoir plus →
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

export default SpacesSlider;
