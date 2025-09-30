// src/types.ts

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
    status: string; // Se mantiene en la data, pero no se usa para filtrar
    date: string; // Fecha en formato ISO
    

    // Campos PC
    nombre_equipo?: string;
    usuario?: string;
    windows?: string;
    ver_win?: string; // Usado para el filtro de Windows
    antivirus?: string
    cpu?: string;
    // Ajustado a number | string para soportar la comparación numérica y 'Otros'
    ram?: number | string; 
    almacenamiento?: number | string; // ✨ CORRECCIÓN: Ajustado a number | string
    motherboard?: string;

    // Campos Impresora
    toner?: string; 
    drum?: string; 
    conexion?: string; 
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
    ver_win: string;
    antivirus: string;
    cpu: string;
    ram: number;
    motherboard: string;
    date: string;
    notes: string;
    direccion: string;
    num_inv: string;
    ip: string;
    usuario: string;
    almacenamiento: number;
    nombre_equipo: string;
    status: string;

    // Impresora
    toner?: string;
    drum?: string;
    conexion?: string;
}

// ----------------------------------------------------------------------
// INTERFACES DE FILTRADO Y PROPIEDADES DE COMPONENTES
// ----------------------------------------------------------------------

// 5. Opciones de Filtro (la estructura que define qué filtros se muestran)
export interface FilterOption {
    label: string;
    value: keyof SelectedFilters;
    options: string[]; // Opciones fijas (e.g., ['i3', 'i5', 'i7'])
}

// 6. Filtros Seleccionados (CORREGIDO: Se añadió 'almacenamiento')
export interface SelectedFilters {
    // Campo Común
    brand: string; 

    // Campos PC
    windows: string;
    cpu: string;
    ram: string;
    almacenamiento: string; // ✨ CORRECCIÓN CRÍTICA: Añadido para resolver el error de tipo.

    // Campos Impresora
    toner: string;
    drum: string;
    conexion: string;
}

// 4. Propiedades de la Sección de Filtro (FilterSectionProps)
export interface FilterSectionProps {
    showFilters: boolean;
    toggleFilters: () => void;
    filterData: FilterOption[];
    isLoading: boolean;
    selectedFilters: SelectedFilters;
    // Asegura que handleFilterChange use las claves correctas
    handleFilterChange: (filterName: keyof SelectedFilters, value: string) => void;
    handleClearFilters: () => void;
    // NUEVOS PROPIEDADES para el selector de tipo de equipo
    activeEquipmentType: 'PC' | 'Impresora';
    handleTypeChange: (type: 'PC' | 'Impresora') => void;
}


// Interfaces de la app (Props de componentes)
export interface ToolbarProps {
    onNewRecordClick: () => void;
    onEquiposClick: () => void;
    currentView: string;
    toggleFilters: () => void;
}

export interface ResultCardProps {
    equipo: EquipoDB; 
}

export interface NewRecordFormProps {
    onBackToList: () => void;
    onRecordCreated: (newRecord: EquipoDB) => void; 
}
