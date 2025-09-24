// Componente para la barra de herramientas (toolbar)
import React from 'react';
import { ToolbarProps } from '../types';


export const Toolbar = ({ onNewRecordClick, onEquiposClick, currentView }: ToolbarProps) => (
  <nav className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
    <div className="flex space-x-2 w-full md:w-auto">
      <button 
        onClick={onEquiposClick}
        className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 font-semibold rounded-lg transition-colors
        ${currentView === 'list' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        <span>Equipos</span>
      </button>
      <button 
        onClick={onNewRecordClick}
        className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 font-semibold rounded-lg transition-colors
        ${currentView === 'form' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span>Nuevo Registro</span>
      </button>
    </div>
    
    {currentView === 'list' && (
      <div className="flex items-center space-x-2 w-full md:w-auto bg-gray-100 rounded-lg p-2 flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input type="text" placeholder="Buscar equipos por marca, modelo, serie o CPU..." className="bg-gray-100 w-full outline-none text-gray-700 placeholder-gray-400" />
      </div>
    )}
  </nav>
);