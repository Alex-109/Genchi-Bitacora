import React from 'react';
import { FilterSectionProps } from '../types';


export const FilterSection = ({ showFilters, toggleFilters, filterData, isLoading, selectedFilters, handleFilterChange, handleClearFilters }: FilterSectionProps) => {
  if (isLoading) {
    return (
      <aside className={`bg-gray-100 p-6 rounded-lg shadow-inner mb-6 transition-all duration-300 transform origin-top ${showFilters ? 'scale-y-100' : 'scale-y-0 h-0 overflow-hidden'}`}>
        <p className="text-gray-500 text-center">Cargando filtros...</p>
      </aside>
    );
  }

  return (
    <>
      <section className="flex items-center space-x-4 mb-6">
        <button
          onClick={toggleFilters}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c1.393 0 2.766.185 4.091.534a12 12 0 0 1 3.518 1.488M12 3c-1.393 0-2.766.185-4.091.534a12 12 0 0 0-3.518 1.488M12 3v18m0-18a6 6 0 0 0-6 6v3m6-9a6 6 0 0 1 6 6v3m-6-3h6m-6 0H6m6 0a2 2 0 0 1-2 2h-2m4 0a2 2 0 0 0 2 2h2m-4-2H6m-6 0h6m-6 0a6 6 0 0 0 6 6v3m-6-9a6 6 0 0 1 6-6v3m-6-3h-6m6 0a2 2 0 0 1-2 2m4 0a2 2 0 0 0 2 2h2m-4-2h-6m6 0a2 2 0 0 1-2-2m4 0a2 2 0 0 0 2 2" />
          </svg>
          <span>Filtros Avanzados</span>
          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">1</span>
        </button>
        <button onClick={handleClearFilters} className="flex items-center space-x-2 px-4 py-2 bg-transparent text-gray-500 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          <span>Limpiar Filtros</span>
        </button>
      </section>

      <aside className={`bg-gray-100 p-6 rounded-lg shadow-inner mb-6 transition-all duration-300 transform origin-top ${showFilters ? 'scale-y-100' : 'scale-y-0 h-0 overflow-hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterData && filterData.map((filter, index) => (
            <div key={index} className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1 text-gray-800">{filter.label}</label>
              <select
                className="bg-white p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800"
                value={selectedFilters[filter.value]}
                onChange={(e) => handleFilterChange(filter.value, e.target.value)}
              >
                {filter.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option} className="text-gray-800">{option}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};