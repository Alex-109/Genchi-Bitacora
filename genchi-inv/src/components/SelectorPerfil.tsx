// src/components/SelectorPerfil.tsx
import React, { useState } from 'react';
import { usePerfil, perfiles } from '../context/PerfilContext';

const SelectorPerfil: React.FC = () => {
  const { perfilSeleccionado, seleccionarPerfil } = usePerfil();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="fixed right-4 bottom-4 z-50" // Cambiado a bottom-4
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 transition-all duration-300 ease-in-out">
        
        {/* Header siempre visible - solo ícono y nombre */}
        <div className="flex items-center gap-3 mb-3 cursor-default">
          <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center text-lg">
            {perfilSeleccionado.icono}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {perfilSeleccionado.nombre.split(' ')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {perfilSeleccionado.cargo}
            </p>
          </div>
        </div>

        {/* Selector de perfiles - solo visible en hover */}
        {isExpanded && (
          <div className="animate-fadeIn">
            <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center border-t pt-2">
              Cambiar perfil
            </h3>
            
            <div className="flex flex-col gap-2">
              {perfiles
                .filter(perfil => perfil.id !== perfilSeleccionado.id)
                .map((perfil) => (
                  <button
                    key={perfil.id}
                    onClick={() => seleccionarPerfil(perfil)}
                    className="
                      flex items-center gap-2 w-full p-2 rounded-lg 
                      border border-gray-200 bg-white 
                      hover:bg-indigo-50 hover:border-indigo-300 
                      transition-all duration-200
                    "
                    title={`${perfil.nombre} - ${perfil.cargo}`}
                  >
                    <span className="text-lg">{perfil.icono}</span>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {perfil.nombre.split(' ')[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {perfil.cargo}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Indicador visual de hover */}
        {!isExpanded && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default SelectorPerfil;