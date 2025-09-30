// src/components/ResultCard.tsx (CORREGIDO)
import React from 'react';
import { ResultCardProps } from '../types'; // Asume que 'types' incluye la definición de Equipo


export const ResultCard = ({ equipo }: ResultCardProps) => { // 1. Cambiar 'pc' a 'equipo'
  
  // Destructuración para mayor claridad
  const { 
    tipo_equipo, marca, status, serie, 
    // Campos PC
    cpu, ram, windows, antivirus, 
    // Campos Impresora
    toner, drum, conexion, date
  } = equipo;

  // Determinar la clase de color basada en el estado
  const statusColor = 
    status === 'En uso' ? 'bg-green-500' :
    status === 'En reparación' ? 'bg-yellow-500' :
    'bg-gray-500';

  return (
    <article className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-lg shadow-md border border-gray-200">
      
      {/* --- Bloque de Información Base --- */}
      <div className="mb-4 sm:mb-0">
        <p className="text-lg font-bold text-gray-800">{marca}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className={`text-white text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>
            {status || 'Pendiente'}
          </span>
          {/* Muestra el tipo de equipo como una etiqueta extra */}
          <span className="text-gray-700 text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 border border-blue-300">
            {tipo_equipo}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-2">S/N: {serie}</p>
      </div>

      {/* --- Bloque de Especificaciones (Condicional) --- */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 text-gray-600 text-sm">
        
        {/* 💻 Renderiza campos de PC solo si es un PC */}
        {tipo_equipo === 'PC' && (
          <>
            {cpu && (
              <div className="flex items-center space-x-1"><span>CPU: {cpu}</span></div>
            )}
            {ram && (
              <div className="flex items-center space-x-1"><span>RAM: {ram}</span></div>
            )}
            {windows && (
              <div className="flex items-center space-x-1"><span>Windows: {windows}</span></div>
            )}
            {antivirus && (
              <div className="flex items-center space-x-1"><span>Antivirus: {antivirus}</span></div>
            )}
            
          </>
        )}

        {/* 🖨️ Renderiza campos de Impresora solo si es una Impresora */}
        {tipo_equipo === 'Impresora' && (
          <>
            {toner && (
              <div className="flex items-center space-x-1"><span>Tóner: {toner}</span></div>
            )}
            {drum && (
              <div className="flex items-center space-x-1"><span>Drum: {drum}</span></div>
            )}
            {conexion && (
              <div className="flex items-center space-x-1"><span>Conexión: {conexion}</span></div>
            )}
          </>
        )}
        
        {/* Fecha de Ingreso (Común) */}
        <div className="flex items-center space-x-1">
          <span>Fecha de Ingreso: {date}</span>
        </div>
      </div>
    </article>
  );
};