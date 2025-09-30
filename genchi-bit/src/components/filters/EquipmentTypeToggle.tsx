// src/components/filters/EquipmentTypeToggle.tsx
import React from 'react';

interface Props {
    activeType: 'PC' | 'Impresora';
    onTypeChange: (type: 'PC' | 'Impresora') => void;
}

const ToggleButton = ({ label, icon, isActive, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
            isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export const EquipmentTypeToggle = ({ activeType, onTypeChange }: Props) => {
    // Definimos los iconos aquí para mayor claridad
    const pcIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.006a3 3 0 0 1-5.633.419 2.755 2.755 0 0 1-1.29-1.29c-.198-.444-.316-.906-.317-1.37A6.9 6.9 0 0 1 7.5 7.375V6.75a3 3 0 0 1 3-3h3.75a3 3 0 0 1 3 3v.625A6.9 6.9 0 0 1 20.933 17.25c-.005.464-.123.926-.317 1.37a2.755 2.755 0 0 1-1.29 1.29 3 3 0 0 1-5.633-.419V17.25M7.5 17.25v-1.006a3 3 0 0 0-5.633-.419 2.755 2.755 0 0 0-1.29 1.29c-.198.444-.316.906-.317 1.37a6.9 6.9 0 0 0 7.5 7.375v.625a3 3 0 0 0 3 3h3.75a3 3 0 0 0 3-3v-.625a6.9 6.9 0 0 0 7.5-7.375c-.005-.464-.123-.926-.317-1.37a2.755 2.755 0 0 0-1.29-1.29 3 3 0 0 0-5.633-.419V17.25" /></svg>;
    const printerIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 16v-4M6 16v4h12v-4M6 16h12M18 16V4M18 16V4h-6M12 4V2M12 2h-2M10 2V4M12 4v2" /></svg>;

    return (
        <div className="flex space-x-2 bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
            <ToggleButton label="PC" icon={pcIcon} isActive={activeType === 'PC'} onClick={() => onTypeChange('PC')} />
            <ToggleButton label="Impresora" icon={printerIcon} isActive={activeType === 'Impresora'} onClick={() => onTypeChange('Impresora')} />
        </div>
    );
};