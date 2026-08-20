import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/EventCard.css';

const EventCard = ({ event }) => (
    <motion.div
        className="event-card"
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300 }}
    >
        {/* Toute la carte est un lien */}
        <Link to={`/evenements/${event.id}`} className="event-card-link">
            {/* Affiche */}
            <div className="event-image">
                <img src={event.image} alt={event.title} />
            </div>

            {/* Bouton sous l'affiche */}
            <div className="event-card-footer">
                <span className="btn-voir-plus">Voir plus →</span>
            </div>
        </Link>
    </motion.div>
);

export default EventCard;
