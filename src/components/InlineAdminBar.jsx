import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Edit3, LayoutDashboard, LogOut, Sparkles, RotateCcw, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useEditMode } from '../context/useEditMode';
import { restorePreviousRevision } from '../lib/contentService';
import '../styles/InlineAdminBar.css';

const InlineAdminBar = ({ onQuickEditArticle = null, currentArticleTitle = null }) => {
    const { isAdmin, logout } = useAuth();
    const { isVisualEditMode, toggleVisualEditMode, deviceView, setDeviceView } = useEditMode();
    const navigate = useNavigate();
    const [rollbackMsg, setRollbackMsg] = useState(null);

    if (!isAdmin) return null;

    const handleRestore = async () => {
        if (window.confirm('Voulez-vous annuler la dernière modification et restaurer la version précédente ?')) {
            const res = await restorePreviousRevision();
            if (res.success) {
                setRollbackMsg('Version précédente restaurée avec succès !');
                setTimeout(() => setRollbackMsg(null), 3000);
            } else {
                alert(res.message || 'Erreur lors de la restauration.');
            }
        }
    };

    return (
        <div className="inline-admin-bar">
            <div className="container inline-admin-container">
                <div className="inline-admin-info">
                    <span className="admin-status-pill">
                        <Shield size={14} /> Admin Connecté
                    </span>
                    {rollbackMsg ? (
                        <span className="current-context-text text-success" style={{ color: '#34d399', fontWeight: 'bold' }}>
                            {rollbackMsg}
                        </span>
                    ) : currentArticleTitle ? (
                        <span className="current-context-text">
                            Article en cours : <strong>{currentArticleTitle}</strong>
                        </span>
                    ) : (
                        <span className="current-context-text hidden-mobile">
                            Gestion & Édition Visuelle en direct
                        </span>
                    )}
                </div>

                <div className="inline-admin-actions">
                    {/* Device Simulator Switcher */}
                    <div className="device-switcher-pill" title="Simuler l'affichage sur ordinateur, tablette ou mobile">
                        <button
                            className={`device-btn ${deviceView === 'desktop' ? 'active' : ''}`}
                            onClick={() => setDeviceView('desktop')}
                            title="Vue Ordinateur (Plein Écran)"
                        >
                            <Monitor size={14} /> <span className="device-label">PC</span>
                        </button>
                        <button
                            className={`device-btn ${deviceView === 'tablet' ? 'active' : ''}`}
                            onClick={() => setDeviceView('tablet')}
                            title="Vue Tablette (768px)"
                        >
                            <Tablet size={14} /> <span className="device-label">Tablette</span>
                        </button>
                        <button
                            className={`device-btn ${deviceView === 'mobile' ? 'active' : ''}`}
                            onClick={() => setDeviceView('mobile')}
                            title="Vue Mobile (390px)"
                        >
                            <Smartphone size={14} /> <span className="device-label">Mobile</span>
                        </button>
                    </div>

                    {/* Visual Edit Mode Toggle */}
                    <button
                        onClick={toggleVisualEditMode}
                        className={`btn-inline-admin toggle-edit ${isVisualEditMode ? 'active' : ''}`}
                        title="Activer/Désactiver le clic direct pour éditer n'importe quel texte sur le site"
                    >
                        <Sparkles size={15} />
                        Mode Édition : <strong>{isVisualEditMode ? 'ACTIF' : 'INACTIF'}</strong>
                    </button>

                    <button
                        onClick={handleRestore}
                        className="btn-inline-admin rollback"
                        title="Annuler la dernière modification et restaurer la version précédente"
                        style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
                    >
                        <RotateCcw size={14} /> Annuler
                    </button>

                    {onQuickEditArticle && (
                        <button
                            onClick={onQuickEditArticle}
                            className="btn-inline-admin edit"
                            title="Corriger cet article directement"
                        >
                            <Edit3 size={15} /> Corriger cet article
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/admin')}
                        className="btn-inline-admin dashboard"
                    >
                        <LayoutDashboard size={15} /> Dashboard Admin
                    </button>

                    <button
                        onClick={logout}
                        className="btn-inline-admin logout"
                        title="Se déconnecter"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InlineAdminBar;
