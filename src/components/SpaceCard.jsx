import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import '../styles/SpaceCard.css';

const SpaceCard = ({ space }) => {
    return (
        <motion.div
            className="space-card-institution"
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
        >
            <div className="space-img-wrapper">
                <img src={space.image} alt={space.title} />
                <div className="space-tag">{space.title}</div>
            </div>
            <div className="space-body">
                <p className="space-desc">{space.description}</p>
                <Link to={`/espaces#${space.id}`} className="space-link">
                    Voir les détails <ArrowRight size={16} />
                </Link>
            </div>
        </motion.div>
    );
};

export default SpaceCard;
