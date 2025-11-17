import React, { useState, useEffect, useCallback } from 'react';
import { objetosVariosApi } from '../services/objetosVarios';
import { obtenerUnidades } from '../services/unidadesApi';
import { useCarrito, type ItemCarrito } from '../context/CarritoContext';
import type { ObjetoVario } from '../types/objetosVarios';
import ModalObjetoVario from '../components/ModalObjetosVarios';

interface Filtros {
  unidad: string;
  buscar: string;
  fechaInicio: string;
  fechaFin: string;
  usarRango: boolean;
}

const ObjetosVariosPage: React.FC = () => {
  const [objetos, setObjetos] = useState<ObjetoVario[]>([]);
  const [unidades, setUnidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingObjeto, setEditingObjeto] = useState<ObjetoVario | null>(null);
  const [filters, setFilters] = useState<Filtros>({
    unidad: 'todas',
    buscar: '',
    fechaInicio: '',
    fechaFin: '',
    usarRango: false
  });
  
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // ✅ Obtener funciones del carrito
  const { carrito, agregarAlCarrito, estaEnCarrito } = useCarrito();

  // ✅ Función para agregar objeto al carrito
  const handleAgregarAlCarrito = (objeto: ObjetoVario) => {
    const itemCarrito: ItemCarrito = {
      id: objeto.id,
      tipo: 'objeto',
      nombre: objeto.nombre,
      unidad: objeto.unidad,
      // Puedes agregar más campos si los necesitas
    };
    agregarAlCarrito(itemCarrito);
  };

  // ✅ Cargar unidades al iniciar
  useEffect(() => {
    const cargarUnidades = async () => {
      try {
        const unidadesData = await obtenerUnidades();
        setUnidades(unidadesData);
      } catch (error) {
        console.error('Error cargando unidades:', error);
        setUnidades([]);
      }
    };
    cargarUnidades();
  }, []);

  const cargarObjetos = useCallback(async () => {
    try {
      setLoading(true);
      
      const filtrosLimpios: Partial<Filtros> = {};
      
      if (filters.unidad !== 'todas') {
        filtrosLimpios.unidad = filters.unidad;
      }
      if (filters.buscar.trim() !== '') {
        filtrosLimpios.buscar = filters.buscar;
      }
      
      if (filters.usarRango) {
        if (filters.fechaInicio) {
          filtrosLimpios.fechaInicio = filters.fechaInicio;
        }
        if (filters.fechaFin) {
          filtrosLimpios.fechaFin = filters.fechaFin;
        }
      } else {
        if (filters.fechaInicio) {
          filtrosLimpios.fechaInicio = filters.fechaInicio;
          filtrosLimpios.fechaFin = filters.fechaInicio;
        }
      }
      
      const data = await objetosVariosApi.obtenerTodos(filtrosLimpios);
      setObjetos(data);
    } catch (error) {
      console.error('Error cargando objetos varios:', error);
      alert('Error al cargar los objetos varios');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      cargarObjetos();
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [filters, cargarObjetos]);

  const handleUsarRangoChange = (usarRango: boolean) => {
    setFilters(prev => ({
      ...prev,
      usarRango,
      fechaFin: usarRango ? prev.fechaFin : ''
    }));
  };

  const handleCrearObjeto = () => {
    setEditingObjeto(null);
    setShowModal(true);
  };

  const handleEditarObjeto = (objeto: ObjetoVario) => {
    setEditingObjeto(objeto);
    setShowModal(true);
  };

  const handleEliminarObjeto = async (objeto: ObjetoVario) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${objeto.nombre}"?`)) {
      return;
    }

    try {
      await objetosVariosApi.eliminar(objeto.id);
      cargarObjetos();
      alert('Objeto eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando objeto:', error);
      alert('Error al eliminar el objeto');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingObjeto(null);
  };

  const handleModalSuccess = () => {
    cargarObjetos();
    handleModalClose();
  };

  const handleFilterChange = (key: keyof Filtros, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLimpiarFiltros = () => {
    setFilters({
      unidad: 'todas',
      buscar: '',
      fechaInicio: '',
      fechaFin: '',
      usarRango: false
    });
  };

  const formatFecha = (fechaString: string | undefined): string => {
    if (!fechaString) return 'Sin fecha';
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida';
      }
      return fecha.toLocaleDateString();
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Error fecha';
    }
  };

  if (loading && objetos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Cargando objetos varios...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Objetos Varios
          </h1>
          <p className="text-gray-600">
            Administra los objetos varios del sistema
          </p>
        </div>

        {/* Filtros y Botón Crear - DISEÑO MEJORADO */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="space-y-4">
            {/* Fila 1: Unidad y Búsqueda */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad
                </label>
                <select
                  value={filters.unidad}
                  onChange={(e) => handleFilterChange('unidad', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="todas">Todas las unidades</option>
                  {unidades.map((unidad) => (
                    <option key={unidad} value={unidad}>{unidad}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <input
                  type="text"
                  value={filters.buscar}
                  onChange={(e) => handleFilterChange('buscar', e.target.value)}
                  placeholder="Nombre, comentarios..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Fila 2: Fechas y Checkbox */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Checkbox */}
              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.usarRango}
                    onChange={(e) => handleUsarRangoChange(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Buscar por rango de fechas
                  </span>
                </label>
              </div>

              {/* Fecha Desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filters.usarRango ? 'Fecha desde' : 'Fecha específica'}
                </label>
                <input
                  type="date"
                  value={filters.fechaInicio}
                  onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Fecha Hasta - Solo si está en modo rango */}
              {filters.usarRango && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha hasta
                  </label>
                  <input
                    type="date"
                    value={filters.fechaFin}
                    onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Espacio flexible para mantener alineación */}
              {!filters.usarRango && <div></div>}
            </div>

            {/* Fila 3: Botones e Información */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span>Total: {objetos.length} objeto(s)</span>
                {(filters.unidad !== 'todas' || filters.buscar || filters.fechaInicio) && (
                  <span className="ml-2 text-indigo-600">
                    • {filters.usarRango ? 'Modo rango' : 'Modo fecha específica'}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleLimpiarFiltros}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={handleCrearObjeto}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm"
                >
                  + Nuevo objeto
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Objetos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {objetos.map((objeto) => {
            const enCarrito = estaEnCarrito(objeto.id);
            
            return (
              <div key={objeto.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {objeto.nombre}
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {formatFecha(objeto.createdAt)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Unidad:</span> {objeto.unidad}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">ID:</span> {objeto.id}
                  </p>
                  {objeto.comentarios && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Comentarios:</span> {objeto.comentarios}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditarObjeto(objeto)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminarObjeto(objeto)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>

                {/* ✅ Botón Agregar al Carrito */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleAgregarAlCarrito(objeto)}
                    disabled={enCarrito}
                    className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                      enCarrito
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {enCarrito ? '✓ En Carrito' : '+ Agregar al Carrito'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {objetos.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron objetos varios</p>
            <button
              onClick={handleCrearObjeto}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Crear primer objeto
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ModalObjetoVario
          objeto={editingObjeto}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          onAgregarAlCarrito={handleAgregarAlCarrito}
          estaEnCarrito={editingObjeto ? estaEnCarrito(editingObjeto.id) : false}
        />
      )}
    </div>
  );
};

export default ObjetosVariosPage;