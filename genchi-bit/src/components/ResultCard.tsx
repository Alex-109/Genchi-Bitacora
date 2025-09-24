// src/components/ResultCard.tsx
import React from 'react';
import { ResultCardProps } from '../types';

export const ResultCard = ({ pc }: ResultCardProps) => (
  <article className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <div className="mb-4 sm:mb-0">
      <p className="text-lg font-bold text-gray-800">{pc.modelo}</p>
      <div className="flex items-center space-x-2 mt-1">
        <span className={`text-white text-xs font-semibold px-2 py-1 rounded-full ${
          pc.status === 'En uso' ? 'bg-green-500' :
          pc.status === 'En reparación' ? 'bg-yellow-500' :
          'bg-gray-500'
        }`}>
          {pc.status || 'Pendiente'}
        </span>
      </div>
      <p className="text-gray-500 text-sm mt-2">S/N: {pc.serie}</p>
    </div>
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 text-gray-600 text-sm">
      <div className="flex items-center space-x-1">
        <span>CPU: {pc.specs?.cpu}</span>
      </div>
      <div className="flex items-center space-x-1">
        <span>RAM: {pc.specs?.ram}</span>
      </div>
      <div className="flex items-center space-x-1">
        <span>Windows: {pc.ver_win}</span>
      </div>
      <div className="flex items-center space-x-1">
        <span>Antivirus: {pc.antivirus}</span>
      </div>
      {pc.specs?.gpu && (
        <div className="flex items-center space-x-1">
          <span>GPU: {pc.specs?.gpu}</span>
        </div>
      )}
      <div className="flex items-center space-x-1">
        <span>Fecha de Ingreso: {pc.date}</span>
      </div>
    </div>
  </article>
);