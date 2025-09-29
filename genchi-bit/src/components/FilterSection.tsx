// src/components/FilterSection.tsx
import React from 'react';
import { FilterSectionProps, FilterOption } from '../types';


export const FilterSection = ({ 
    showFilters, 
    toggleFilters, 
    filterData, 
    isLoading, 
    selectedFilters, 
    handleFilterChange, 
    handleClearFilters 
}: FilterSectionProps) => {

    // Función auxiliar para renderizar cada SELECT de filtro
    const renderFilterSelect = (filter: FilterOption) => (
        <div key={filter.value} className="flex flex-col">
            <label htmlFor={filter.value} className="text-sm font-medium text-gray-700 mb-1">
                {filter.label}
            </label>
            <select
                id={filter.value}
                name={filter.value}
                value={selectedFilters[filter.value]}
                onChange={(e) => handleFilterChange(filter.value, e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2"
            >
                {filter.options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );


    return (
        <>
            {/* Sección para el botón de filtros y la acción de limpiar */}
            <section className="flex items-center justify-between space-x-4 mb-4">
                <button
                    onClick={toggleFilters}
                    className="flex items-center space-x-2 px-4 py-2 font-semibold rounded-lg transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.485.111 8.24 1.159 1.488.572 2.51 2.016 2.51 3.512V19.5a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 19.5V7.621c0-1.5 1.022-2.94 2.51-3.512A21.432 21.432 0 0 1 12 3Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
                    </svg>
                    <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                </button>

                <button
                    onClick={handleClearFilters}
                    disabled={isLoading}
                    className="flex items-center space-x-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-opacity"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filterData.map(renderFilterSelect)}
                    </div>
                )}
            </aside>
        </>
    );
};