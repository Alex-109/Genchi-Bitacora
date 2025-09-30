// src/components/filters/FilterSelect.tsx
import React from 'react';
import { FilterOption, SelectedFilters } from '../../types';

interface Props {
    filter: FilterOption;
    selectedValue: string;
    onFilterChange: (filterName: keyof SelectedFilters, value: string) => void;
    isLoading: boolean;
}

// La lógica para formatear el display se mueve aquí
const getDisplayOption = (filterValue: keyof SelectedFilters, optionValue: string) => {
    if (filterValue === 'ram' && !isNaN(Number(optionValue))) {
        return `${optionValue}GB`;
    }
    if (filterValue === 'almacenamiento' && !isNaN(Number(optionValue))) {
        return Number(optionValue) >= 1000 ? `${Number(optionValue) / 1000}TB` : `${optionValue}GB`;
    }
    return optionValue;
};

export const FilterSelect = ({ filter, selectedValue, onFilterChange, isLoading }: Props) => {
    
    // Con esta estructura, ya no se necesita el casting `as`. TypeScript entiende que filter.value es del tipo correcto.
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange(filter.value, e.target.value);
    };

    return (
        <div className="flex flex-col">
            <label htmlFor={filter.value} className="text-sm font-medium text-gray-700 mb-1">
                {filter.label}
            </label>
            <select
                id={filter.value}
                name={filter.value}
                value={selectedValue || ''}
                onChange={handleChange}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 text-gray-900"
            >
                <option value="">Todos</option>
                {filter.options.map((option) => (
                    <option key={option} value={option}>
                        {getDisplayOption(filter.value, option)}
                    </option>
                ))}
            </select>
        </div>
    );
};