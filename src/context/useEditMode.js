import { useContext } from 'react';
import { EditModeContext } from './EditModeContextObject';

export const useEditMode = () => {
    const ctx = useContext(EditModeContext);
    if (!ctx) {
        return { isVisualEditMode: false, toggleVisualEditMode: () => {}, deviceView: 'desktop', setDeviceView: () => {} };
    }
    return ctx;
};
