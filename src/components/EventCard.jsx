import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import '../styles/EventCard.css';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            const formatted = date.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }
        return dateStr;
    } catch {
        return dateStr;
    }
};

const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '00:00') return null;
    return `Dès ${timeStr.replace(':', 'h')}`;
};

const EventCard = ({ event }) => {
    const formattedDate = formatDate(event.date);
    const formattedTime = formatTime(event.time);

    return (
        <motion.div
            className="event-card"
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            {/* Toute la carte est un lien */}
            <Link to={`/evenements/${event.id}`} className="event-card-link">
                {/* Affiche */}
                <div className="event-image">
                    {formattedDate && (
                        <div className="event-image-badge">
                            <Calendar size={13} />
                            <span>{formattedDate}</span>
                            {formattedTime && (
                                <>
                                    <span className="badge-dot">•</span>
                                    <Clock size={13} />
                                    <span>{formattedTime}</span>
                                </>
                            )}
                        </div>
                    )}
                    <img src={event.image} alt={event.title} />
                </div>

                {/* Date, Heure & Bouton sous l'affiche */}
                <div className="event-card-footer">
                    <div className="event-schedule-bar">
                        {formattedDate && (
                            <div className="schedule-item date-item">
                                <Calendar size={15} />
                                <span>{formattedDate}</span>
                            </div>
                        )}
                        {formattedTime && (
                            <div className="schedule-item time-item">
                                <Clock size={15} />
                                <span>{formattedTime}</span>
                            </div>
                        )}
                    </div>

                    <span className="btn-voir-plus">Voir plus →</span>
                </div>
            </Link>
        </motion.div>
    );
};

export default EventCard;
