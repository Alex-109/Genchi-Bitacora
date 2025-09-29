import React from 'react';

// Interfaces ajustadas a la estructura unificada de Express/MongoDB.

// 1. Interfaz base de Equipo: (Datos tal como vienen de la DB)
export interface EquipoDB {
    _id?: string;
    // Campos comunes
    serie: string;
    modelo: string;
    num_inv?: string;
    ip?: string;
    direccion: string;
    marca: string;
    tipo_equipo: 'PC' | 'Monitor' | 'Laptop' | 'Impresora' | string;
    status: string;

    // Campos PC
    nombre_equipo?: string;
    usuario?: string;
    ver_win?: string;
    antivirus?: string
    cpu?: string;
    ram?: string;
    almacenamiento?: string;
    gpu?: string;
    gpuModel?: string;
    powerSupply?: string;
    motherboard?: string;

    // Campos Impresora
    toner?: string; // Lo añadimos para que esté disponible en la DB
    drum?: string;  // Lo añadimos para que esté disponible en la DB
    conexion?: string; // Lo añadimos para que esté disponible en la DB
    printerType?: string; 
    color?: boolean;
    duplex?: boolean;
    networked?: boolean;
    
    // Otros
    notes?: string;
}

// 2. Estado de las direcciones
export interface DireccionDB {
    direccion: string;
    nombre_u: string;
}

// 3. Estado del formulario (Input del usuario)
export interface NewRecordFormState {
    tipoEquipo: 'PC' | 'Impresora';
    model: string;
    brand: string;
    serialNumber: string;
    windows: string;
    antivirus: string;
    cpu: string;
    ram: string;
    gpu: boolean;
    gpuModel: string;
    powerSupply: string;
    motherboard: string;
    date: string;
    notes: string;
    direccion: string;
    num_inv: string;
    ip: string;
    usuario: string;

    // Impresora
    toner?: string;
    drum?: string;
    conexion?: string;
}

// 4. Combina datos para frontend (Base de datos + campos calculados/formateados para UI)
// 📌 CAMBIO CLAVE: Renombrado a EquipoCombined
export interface EquipoCombined extends EquipoDB {
    // Estos campos suelen ser redundantes si ya vienen de EquipoDB,
    // pero se mantienen si necesitas un tipo específico para la tarjeta.
    brand: string;
    status: string;
    date: string; // Asumo que es un campo formateado
}

// Interfaces de la app (Props de componentes)
export interface ToolbarProps {
    onNewRecordClick: () => void;
    onEquiposClick: () => void;
    currentView: string;
    toggleFilters: () => void;
}

export interface FilterSectionProps {
    showFilters: boolean;
    toggleFilters: () => void;
    filterData: FilterOption[];
    isLoading: boolean;
    selectedFilters: SelectedFilters;
    handleFilterChange: (filterName: keyof SelectedFilters, value: string) => void;
    handleClearFilters: () => void;
}

// 📌 CAMBIO CLAVE: Usa 'equipo' y el tipo unificado EquipoCombined
export interface ResultCardProps {
    equipo: EquipoCombined; 
}

export interface NewRecordFormProps {
    onBackToList: () => void;
    // Asumo que el registro creado que se pasa es el tipo combinado para el listado
    onRecordCreated: (newRecord: EquipoCombined) => void; 
}

export interface FilterOption {
    label: string;
    value: keyof SelectedFilters;
    options: string[];
}

export interface SelectedFilters {
    brand: string;
    windows: string;
    cpu: string;
    ram: string;
    gpu: string;
    status: string;
    // Puedes añadir tipo_equipo si quieres filtrar por PC/Impresora
    tipo_equipo?: string; 
}
