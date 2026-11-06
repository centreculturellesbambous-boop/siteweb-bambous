import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Upload, Check, Copy, FolderPlus, Image as ImageIcon } from 'lucide-react';
import '../styles/MediaLibraryModal.css';

const DEFAULT_MEDIA_ITEMS = [
    { id: 1, label: 'Accueil / Bâtiment Principal', category: 'Bâtiment', url: '/images/home.jpeg' },
    { id: 2, label: 'Spectacle Amazones de Sya', category: 'Spectacle', url: '/images/ama.jpeg' },
    { id: 3, label: 'Ateliers & Artistes en création', category: 'Artistes', url: '/images/arts.jpeg' },
    { id: 4, label: 'Grande Scène Victor Dème', category: 'Bâtiment', url: '/images/scene.jpg' },
    { id: 5, label: 'Salle de Répétition Insonorisée', category: 'Bâtiment', url: '/images/salle.jpeg' },
    { id: 6, label: 'Scène Extérieure terrasse', category: 'Bâtiment', url: '/images/live.jpg' },
    { id: 7, label: 'Bar & Maquis du Centre', category: 'Bâtiment', url: '/images/bar.jpg' },
    { id: 8, label: 'Résidence Choregraphique Amazones', category: 'Spectacle', url: '/images/AMAZONE DE SIA 02.jpeg' },
    { id: 9, label: 'Concert Troupe Djiguiya', category: 'Spectacle', url: '/images/djiguiya.jpg' },
    { id: 10, label: 'Concert Maya Diya', category: 'Spectacle', url: '/images/maya.jpg' },
    { id: 11, label: 'Cours de Danse Africaine', category: 'Cours', url: '/images/cours-de-danse.jpg' },
    { id: 12, label: 'Atelier Peinture & Arts', category: 'Cours', url: '/images/arts plastique.jpeg' },
    { id: 13, label: 'Camp Vacances Culture', category: 'Cours', url: '/images/CAMPS 00.jpeg' },
    { id: 14, label: 'Le Foot en Direct aux Bambous', category: 'Spectacle', url: '/images/foot-en-direct.jpg' },
    { id: 15, label: 'La Rentrée Culturelle des Bambous', category: 'Spectacle', url: '/images/rentree-culturelle-2026.jpg' }
];

const CATEGORIES = ['Tous', 'Bâtiment', 'Spectacle', 'Cours', 'Artistes', 'Perso'];

const MediaLibraryModal = ({ isOpen, onClose, onSelectImage, currentUrl = '' }) => {
    const [mediaItems, setMediaItems] = useState(() => {
        try {
            const saved = localStorage.getItem('bambous_custom_media_items');
            if (saved) return [...DEFAULT_MEDIA_ITEMS, ...JSON.parse(saved)];
        } catch { }
        return DEFAULT_MEDIA_ITEMS;
    });

    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [searchQuery, setSearchQuery] = useState('');
    const [customUrlInput, setCustomUrlInput] = useState('');
    const [copiedUrl, setCopiedUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const filteredItems = mediaItems.filter(item => {
        const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
        const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.url.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleSelect = (url) => {
        if (onSelectImage) onSelectImage(url);
        onClose();
    };

    const processFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const newUrl = e.target.result;
            const newItem = {
                id: `custom_${Date.now()}`,
                label: file.name.replace(/\.[^/.]+$/, ""),
                category: 'Perso',
                url: newUrl
            };
            const updated = [newItem, ...mediaItems];
            setMediaItems(updated);
            try {
                const customOnly = updated.filter(i => String(i.id).startsWith('custom_'));
                localStorage.setItem('bambous_custom_media_items', JSON.stringify(customOnly));
            } catch { }
            handleSelect(newUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        processFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        processFile(file);
    };

    const handleCopyUrl = (url, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const handleAddCustomUrl = (e) => {
        e.preventDefault();
        if (!customUrlInput.trim()) return;
        handleSelect(customUrlInput.trim());
    };

    return createPortal(
        <AnimatePresence>
            <div className="media-modal-overlay" onClick={onClose}>
                <motion.div
                    className="media-modal-content"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="media-modal-header">
                        <div className="media-modal-title">
                            <ImageIcon size={22} className="title-icon" />
                            <div>
                                <h2>Médiathèque du Centre Culturel</h2>
                                <p>Sélectionnez une image ou téléversez une photo depuis votre appareil</p>
                            </div>
                        </div>
                        <button className="btn-close-media-modal" onClick={onClose} aria-label="Fermer">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Toolbar / Search & Filter */}
                    <div className="media-modal-toolbar">
                        <div className="media-search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher une photo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="clear-search-btn" onClick={() => setSearchQuery('')}><X size={14} /></button>
                            )}
                        </div>

                        <div className="category-pills">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Drag Drop & Upload Section */}
                    <div
                        className={`media-upload-dropzone ${isDragging ? 'dragging' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <div className="dropzone-info">
                            <FolderPlus size={24} className="upload-icon" />
                            <span>Glissez-déposez une photo ici ou </span>
                            <button
                                type="button"
                                className="btn-browse-file"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={14} /> Parcourir vos fichiers...
                            </button>
                        </div>
                    </div>

                    {/* Custom URL form */}
                    <form onSubmit={handleAddCustomUrl} className="custom-url-form">
                        <input
                            type="text"
                            placeholder="Ou coller une URL d'image externe (https://...)"
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                        />
                        <button type="submit" className="btn-use-url">Utiliser cette URL</button>
                    </form>

                    {/* Media Grid */}
                    <div className="media-grid-container">
                        {filteredItems.length === 0 ? (
                            <div className="empty-media-msg">
                                <ImageIcon size={36} />
                                <p>Aucune photo ne correspond à votre recherche.</p>
                            </div>
                        ) : (
                            <div className="media-grid">
                                {filteredItems.map(item => {
                                    const isSelected = currentUrl === item.url;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`media-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleSelect(item.url)}
                                        >
                                            <div className="media-thumb-wrapper">
                                                <img src={item.url} alt={item.label} loading="lazy" />
                                                {isSelected && (
                                                    <div className="selected-badge">
                                                        <Check size={16} />
                                                    </div>
                                                )}
                                                <div className="media-hover-overlay">
                                                    <button
                                                        type="button"
                                                        className="action-btn copy-btn"
                                                        onClick={(e) => handleCopyUrl(item.url, e)}
                                                        title="Copier le lien"
                                                    >
                                                        {copiedUrl === item.url ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="media-card-info">
                                                <span className="media-card-label" title={item.label}>{item.label}</span>
                                                <span className="media-card-tag">{item.category}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default MediaLibraryModal;
