import React, { useState, useRef } from 'react';
import { Edit3, Check, X, Image as ImageIcon, Camera, Upload, FolderPlus } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useEditMode } from '../context/useEditMode';
import { updateFieldContent } from '../lib/contentService';
import MediaLibraryModal from './MediaLibraryModal';
import '../styles/EditableText.css';

const PRESET_IMAGES = [
    { label: 'Accueil / Bâtiment', url: '/images/home.jpeg' },
    { label: 'Amazones de Sya', url: '/images/ama.jpeg' },
    { label: 'Artistes / Création', url: '/images/arts.jpeg' },
    { label: 'Grande Scène', url: '/images/scene.jpg' },
    { label: 'Salle de Répétition', url: '/images/salle.jpeg' },
    { label: 'Scène Extérieure Live', url: '/images/live.jpg' },
    { label: 'Espace Bar & Maquis', url: '/images/bar.jpg' },
    { label: 'Résidence Sya 2', url: '/images/AMAZONE DE SIA 02.jpeg' },
    { label: 'Troupe Djiguiya', url: '/images/djiguiya.jpg' },
    { label: 'Maya Diya', url: '/images/maya.jpg' },
    { label: 'Cours de Danse', url: '/images/cours-de-danse.jpg' }
];

const EditableText = ({
    fieldPath,
    value,
    children,
    type = 'text', // 'text' | 'textarea' | 'image'
    label = 'Élément du site',
    as = 'span',
    className = '',
    ...props
}) => {
    const Tag = as;
    const { isAdmin } = useAuth();
    const { isVisualEditMode } = useEditMode();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value || '');
    const [isDragging, setIsDragging] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const isEditable = isAdmin && isVisualEditMode;

    const handleOpenEdit = (e) => {
        if (!isEditable) return;
        e.stopPropagation();
        e.preventDefault();
        if (type === 'image') {
            setIsMediaModalOpen(true);
        } else {
            setEditValue(value || '');
            setIsEditing(true);
        }
    };

    const handleSaveImage = async (newUrl) => {
        await updateFieldContent(fieldPath, newUrl);
        setIsMediaModalOpen(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await updateFieldContent(fieldPath, editValue);
        setIsEditing(false);
    };

    // Process file select or drag drop
    const processImageFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            setEditValue(uploadEvent.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        processImageFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        processImageFile(file);
    };

    if (!isEditable) {
        return <Tag className={className} {...props}>{children || value}</Tag>;
    }

    return (
        <Tag className={`editable-text-wrapper ${type === 'image' ? 'editable-image-wrapper' : ''} ${className}`} onClick={handleOpenEdit} title={`Cliquer pour modifier (${label})`} {...props}>
            {children || value}
            <button
                type="button"
                className={`editable-text-badge ${type === 'image' ? 'badge-camera' : ''}`}
                onClick={handleOpenEdit}
                title={`Cliquer pour modifier (${label})`}
            >
                {type === 'image' ? (
                    <>
                        <Camera size={14} />
                        <span className="badge-camera-label">Changer la photo</span>
                    </>
                ) : (
                    <Edit3 size={12} />
                )}
            </button>

            {isEditing && (
                <div className={`editable-text-popover ${type === 'image' ? 'popover-large-image' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div className="popover-header">
                        <span>{type === 'image' ? '📷 Modifier l\'Image :' : '✏️ Éditer :'} <strong>{label}</strong></span>
                        <button type="button" className="btn-close-popover" onClick={() => setIsEditing(false)}><X size={14} /></button>
                    </div>

                    <form onSubmit={handleSave} className="popover-form">
                        {type === 'image' ? (
                            <div className="image-editor-box">
                                {/* Preview Banner & Drag Drop Zone */}
                                <div
                                    className={`image-preview-frame ${isDragging ? 'dragging' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <img src={editValue || '/images/home.jpeg'} alt="Aperçu" className="image-preview-img" />
                                    <span className="preview-tag">Aperçu en direct</span>
                                    {isDragging && <div className="drag-overlay">Déposez votre photo ici !</div>}
                                </div>

                                {/* Native File Manager & Media Library Buttons */}
                                <div className="file-picker-section">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-upload-file"
                                        onClick={() => setIsMediaModalOpen(true)}
                                    >
                                        <ImageIcon size={16} /> 🖼️ Ouvrir la Médiathèque...
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-upload-file secondary"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <FolderPlus size={16} /> Parcourir vos fichiers...
                                    </button>
                                </div>

                                {/* Custom URL Input */}
                                <div className="input-group-image">
                                    <label>Ou coller une URL d'image :</label>
                                    <input
                                        type="text"
                                        className="popover-input"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        placeholder="/images/nom-photo.jpg ou URL https://..."
                                    />
                                </div>

                                {/* Presets Gallery Picker */}
                                <div className="presets-picker">
                                    <label className="presets-label"><ImageIcon size={12} /> Ou choisir parmi les photos du centre :</label>
                                    <div className="presets-grid">
                                        {PRESET_IMAGES.map((imgItem) => (
                                            <button
                                                key={imgItem.url}
                                                type="button"
                                                className={`preset-thumb-btn ${editValue === imgItem.url ? 'active' : ''}`}
                                                onClick={() => setEditValue(imgItem.url)}
                                                title={imgItem.label}
                                            >
                                                <img src={imgItem.url} alt={imgItem.label} />
                                                <span className="preset-thumb-label">{imgItem.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : type === 'textarea' ? (
                            <textarea
                                rows="4"
                                className="popover-input"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                                required
                            />
                        ) : (
                            <input
                                type="text"
                                className="popover-input"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                autoFocus
                                required
                            />
                        )}

                        <div className="popover-actions">
                            <button type="button" onClick={() => setIsEditing(false)} className="btn-popover cancel">
                                Annuler
                            </button>
                            <button type="submit" className="btn-popover save">
                                <Check size={14} /> Enregistrer l'Image
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <MediaLibraryModal
                isOpen={isMediaModalOpen}
                onClose={() => setIsMediaModalOpen(false)}
                currentUrl={value || editValue}
                onSelectImage={handleSaveImage}
            />
        </Tag>
    );
};

export default EditableText;
