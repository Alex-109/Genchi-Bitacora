// src/components/results/SpecItem.tsx
import React from 'react';

interface Props {
    label: string;
    value?: string | number;
}

export const SpecItem = ({ label, value }: Props) => {
    if (!value) return null; // No renderizar si no hay valor

    return (
        <div className="flex items-center space-x-1 text-gray-600 text-sm">
            <span className="font-semibold">{label}:</span>
            <span>{value}</span>
        </div>
    );
};