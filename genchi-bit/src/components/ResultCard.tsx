// src/components/ResultCard.tsx
import React from 'react';
import { ResultCardProps } from '../types';
import { SpecItem } from './results/SpecItem'; // Importamos el nuevo componente

export const ResultCard = ({ equipo }: ResultCardProps) => {
    const { tipo_equipo, marca, status, serie, date, ...specs } = equipo;

    const statusColor = 
        status === 'En uso' ? 'bg-green-500' :
        status === 'En reparación' ? 'bg-yellow-500' :
        'bg-gray-500';

    // Creamos un array de especificaciones basado en el tipo de equipo
    let specsToShow: { label: string; value?: string | number }[] = [];

    if (tipo_equipo === 'PC') {
        specsToShow = [
            { label: 'CPU', value: specs.cpu },
            { label: 'RAM', value: specs.ram ? `${specs.ram}GB` : undefined },
            { label: 'Windows', value: specs.windows },
            { label: 'Antivirus', value: specs.antivirus },
        ];
    } else if (tipo_equipo === 'Impresora') {
        specsToShow = [
            { label: 'Tóner', value: specs.toner },
            { label: 'Drum', value: specs.drum },
            { label: 'Conexión', value: specs.conexion },
        ];
    }
    
    // Siempre añadimos la fecha
    specsToShow.push({ label: 'Ingreso', value: date ? new Date(date).toLocaleDateString() : undefined });

    return (
        <article className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-lg shadow-md border border-gray-200">
            {/* Info Base (sin cambios) */}
            <div className="mb-4 sm:mb-0">
                <p className="text-lg font-bold text-gray-800">{marca}</p>
                <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-white text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>
                        {status || 'Pendiente'}
                    </span>
                    <span className="text-gray-700 text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 border border-blue-300">
                        {tipo_equipo}
                    </span>
                </div>
                <p className="text-gray-500 text-sm mt-2">S/N: {serie}</p>
            </div>

            {/* Especificaciones (Ahora es dinámico) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end sm:flex-wrap sm:justify-end gap-x-4 gap-y-2">
                {specsToShow.map(spec => (
                    <SpecItem key={spec.label} label={spec.label} value={spec.value} />
                ))}
            </div>
        </article>
    );
};