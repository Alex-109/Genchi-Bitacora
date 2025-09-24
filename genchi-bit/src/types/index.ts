// src/types/index.ts
import React from 'react';

// Interfaces basadas en tu esquema de base de datos de Supabase
export interface EquipoDB {
    serie: string;
    modelo: string;
    num_inv?: string;
    ip?: string;
    direccion: string;
    marca: string;
}

export interface PcDB {
    serie: string;
    nombre_equipo: string;
    usuario: string;
    ver_win: string;
    antivirus: string;
    specs: {
        cpu?: string;
        ram?: string;
        gpu?: string;
        gpuModel?: string;
        powerSupply?: string;
        motherboard?: string;
    };
}

// Interfaz que define el tipo de dato que contiene el estado de las direcciones.
export interface DireccionDB {
    direccion: string;
    nombre_u: string;
}

// Interfaz para el estado del formulario de creación de registros
export interface NewRecordFormState {
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
    num_inv: string; // <-- Agregado
    ip: string;      // <-- Agregado
    usuario: string; // <-- Agregado
}

// Interfaz que combina los datos para el frontend
export interface PcCombined {
    serie: string;
    modelo: string;
    num_inv?: string;
    ip?: string;
    direccion: string;
    marca: string;
    nombre_equipo: string;
    usuario: string;
    ver_win: string;
    antivirus: string;
    specs: {
        cpu?: string;
        ram?: string;
        gpu?: string;
        gpuModel?: string;
        powerSupply?: string;
        motherboard?: string;
    };
    brand: string;
    status: string;
    date: string;
}

// Interfaces de la aplicación que usan los tipos de la base de datos
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

export interface ResultCardProps {
    pc: PcCombined;
}

export interface NewRecordFormProps {
    onBackToList: () => void;
    onRecordCreated: (newRecord: PcCombined) => void;
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
}