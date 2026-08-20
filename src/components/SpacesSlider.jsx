import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
                {spaces.map((space) => (
                    <SwiperSlide key={space.id}>
                        <motion.div
                            className="space-carousel-card"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="space-card-img">
                                <img src={space.image} alt={space.title} />
                                <div className="space-card-overlay"></div>
                                <div className="space-card-info">
                                    <h3>{space.title}</h3>
                                    <p>{space.description}</p>
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
