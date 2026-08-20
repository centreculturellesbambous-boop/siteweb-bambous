import { useState } from 'react';
import { EditModeContext } from './EditModeContextObject';

export const EditModeProvider = ({ children }) => {
    const [isVisualEditMode, setIsVisualEditMode] = useState(() => {
        try {
            return localStorage.getItem('bambous_visual_edit_mode') === 'true';
        } catch {
            return false;
        }
    });

    const [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

    const toggleVisualEditMode = () => {
        setIsVisualEditMode(prev => {
            const next = !prev;
            try {
                localStorage.setItem('bambous_visual_edit_mode', String(next));
            } catch (err) {
                console.error(err);
            }
            return next;
        });
    };

    return (
        <EditModeContext.Provider value={{
            isVisualEditMode,
            toggleVisualEditMode,
            setIsVisualEditMode,
            deviceView,
            setDeviceView
        }}>
            {children}
        </EditModeContext.Provider>
    );
};
