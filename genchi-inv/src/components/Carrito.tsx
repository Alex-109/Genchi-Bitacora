import React, { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { usePerfil } from '../context/PerfilContext';
import type { ItemCarrito } from '../context/CarritoContext';
import { generarActaEntregaMultiple } from '../services/actaApi';

interface CarritoProps {
  isOpen: boolean;
  onClose: () => void;
}

const Carrito: React.FC<CarritoProps> = ({ isOpen, onClose }) => {
  const { carrito, eliminarDelCarrito, limpiarCarrito } = useCarrito();
  const { perfilSeleccionado } = usePerfil();
  const [generando, setGenerando] = useState(false);

  const handleGenerarActa = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setGenerando(true);
    try {
      const equiposIds = carrito
        .filter(item => item.tipo === 'equipo')
        .map(item => item.id);
      
      const objetosIds = carrito
        .filter(item => item.tipo === 'objeto')
        .map(item => item.id);

      await generarActaEntregaMultiple(
        { equiposIds, objetosIds },
        {
          nombre: perfilSeleccionado.nombre,
          cargo: perfilSeleccionado.cargo
        }
      );

      limpiarCarrito();
      onClose();
      alert('✅ Acta generada exitosamente');

    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error generando acta');
    } finally {
      setGenerando(false);
    }
  };

  const obtenerNombreItem = (item: ItemCarrito) => {
    if (item.tipo === 'equipo') {
      return `${item.tipo_equipo} - ${item.marca} ${item.modelo}`;
    } else {
      return `${item.nombre} - ${item.unidad}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🛒 Carrito ({carrito.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={limpiarCarrito}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            ✕
          </button>
        </div>
      </div>

      {carrito.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          <div className="text-2xl mb-2">🛒</div>
          <p className="font-medium">Carrito vacío</p>
          <p className="text-sm">Agrega equipos desde las tarjetas</p>
        </div>
      ) : (
        <>
          {/* Items List */}
          <div className="space-y-2 mb-4">
            {carrito.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700 flex-1 truncate mr-2">
                  {obtenerNombreItem(item)}
                </span>
                <button 
                  onClick={() => eliminarDelCarrito(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Información del Perfil Seleccionado - SOLO LECTURA */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Encargado de Entrega</h4>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-sm">
                {perfilSeleccionado.icono}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {perfilSeleccionado.nombre}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {perfilSeleccionado.cargo}
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 Puedes cambiar el perfil en el selector flotante
            </p>
          </div>

          {/* Acciones */}
          <button 
            onClick={handleGenerarActa}
            disabled={generando || carrito.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
          >
            {generando ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : (
              `📄 Generar Acta (${carrito.length})`
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default Carrito;