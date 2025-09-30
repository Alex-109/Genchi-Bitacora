// src/components/FilterSection.tsx

import React from 'react';
import { FilterSectionProps, FilterOption, SelectedFilters } from '../types'; 
// Importé SelectedFilters para el casting explícito

export const FilterSection = ({ 
    showFilters, 
    toggleFilters, 
    filterData, 
    isLoading, 
    selectedFilters, 
    handleFilterChange, 
    handleClearFilters,
    activeEquipmentType, 
    handleTypeChange 
}: FilterSectionProps) => {

    // Función auxiliar para renderizar cada SELECT de filtro
    const renderFilterSelect = (filter: FilterOption) => {
        
        // Función para mostrar la etiqueta del filtro con su unidad (GB/TB)
        const getDisplayOption = (optionValue: string) => {
            if (filter.value === 'ram' && !isNaN(Number(optionValue))) {
                return `${optionValue}GB`;
            }
            if (filter.value === 'almacenamiento' && !isNaN(Number(optionValue))) {
                // Si es 1000 o más, mostrar en TB, sino en GB
                return Number(optionValue) >= 1000 ? `${Number(optionValue) / 1000}TB` : `${optionValue}GB`;
            }
            return optionValue;
        };

        return (
            <div key={filter.value} className="flex flex-col">
                <label htmlFor={filter.value} className="text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                </label>
                <select
                    id={filter.value}
                    name={filter.value}
                    // Accedemos al valor usando el indexer, ya que filter.value es keyof SelectedFilters
                    value={selectedFilters[filter.value] || ''} 
                    // 🚨 CORRECCIÓN CLAVE: Cast explícito a keyof SelectedFilters para el compilador
                    onChange={(e) => handleFilterChange(filter.value as keyof SelectedFilters, e.target.value)}
                    disabled={isLoading}
                    // AÑADIDO: text-gray-900 para forzar el color oscuro dentro del dropdown
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 text-gray-900"
                >
                    <option value="">Todos</option> {/* Opción "Todos" por defecto */}
                    {filter.options.map((option) => (
                        <option key={option} value={option}>
                            {getDisplayOption(option)} 
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <>
            {/* Sección de Control: Botón de Filtros, Selector de Tipo y Limpiar */}
            <section className="flex flex-wrap items-center justify-between space-y-3 sm:space-y-0 mb-4">
                
                {/* Grupo: Botón de Filtros + Selector de Tipo */}
                <div className="flex items-center space-x-4">
                    {/* Botón Mostrar/Ocultar Filtros */}
                    <button
                        onClick={toggleFilters}
                        className="flex items-center space-x-2 px-4 py-2 font-semibold rounded-lg transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        {/* Icono de Filtro (Mantenido) */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.485.111 8.24 1.159 1.488.572 2.51 2.016 2.51 3.512V19.5a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 19.5V7.621c0-1.5 1.022-2.94 2.51-3.512A21.432 21.432 0 0 1 12 3Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
                        </svg>
                        <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                    </button>

                    {/* Separador */}
                    <div className="border-l border-gray-300 h-6"></div>

                    {/* Selector PC / Impresora (Usando botones con iconos/texto) */}
                    <div className="flex space-x-2 bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
                        {/* Botón PC */}
                        <button
                            onClick={() => handleTypeChange('PC')}
                            className={`flex items-center space-x-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                                activeEquipmentType === 'PC' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.006a3 3 0 0 1-5.633.419 2.755 2.755 0 0 1-1.29-1.29c-.198-.444-.316-.906-.317-1.37A6.9 6.9 0 0 1 7.5 7.375V6.75a3 3 0 0 1 3-3h3.75a3 3 0 0 1 3 3v.625A6.9 6.9 0 0 1 20.933 17.25c-.005.464-.123.926-.317 1.37a2.755 2.755 0 0 1-1.29 1.29 3 3 0 0 1-5.633-.419V17.25M7.5 17.25v-1.006a3 3 0 0 0-5.633-.419 2.755 2.755 0 0 0-1.29 1.29c-.198.444-.316.906-.317 1.37a6.9 6.9 0 0 0 7.5 7.375v.625a3 3 0 0 0 3 3h3.75a3 3 0 0 0 3-3v-.625a6.9 6.9 0 0 0 7.5-7.375c-.005-.464-.123-.926-.317-1.37a2.755 2.755 0 0 0-1.29-1.29 3 3 0 0 0-5.633-.419V17.25" />
                            </svg>
                            <span>PC</span>
                        </button>
                        {/* Botón Impresora */}
                        <button
                            onClick={() => handleTypeChange('Impresora')}
                            className={`flex items-center space-x-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                                activeEquipmentType === 'Impresora' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 16v-4M6 16v4h12v-4M6 16h12M18 16V4M18 16V4h-6M12 4V2M12 2h-2M10 2V4M12 4v2" />
                            </svg>
                            <span>Impresora</span>
                        </button>
                    </div>
                </div>

                {/* Botón Limpiar Filtros */}
                <button
                    onClick={handleClearFilters}
                    disabled={isLoading}
                    className="flex items-center space-x-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-opacity mt-3 sm:mt-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 13.844-4.832c.706-.576 1.442-.647 1.442-.647m1.442-.647l-3.181-3.182a8.25 8.25 0 0 0-13.844 4.832c-.706.576-1.442.647-1.442.647" />
                    </svg>
                    <span>Limpiar Filtros</span>
                </button>
            </section>

            {/* Contenedor de los Filtros */}
            <aside className={`bg-gray-100 p-6 rounded-lg shadow-inner mb-6 transition-all duration-300 transform origin-top ${showFilters ? 'scale-y-100 opacity-100 h-auto' : 'scale-y-0 opacity-0 h-0 overflow-hidden'}`}>
                {isLoading ? (
                    <div className="text-center text-gray-500 py-4">Cargando opciones de filtro...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
                        {filterData.map(renderFilterSelect)}
                    </div>
                )}
            </aside>
        </>
    );
};
