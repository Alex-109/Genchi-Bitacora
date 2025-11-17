import React, { useState, useEffect, useCallback } from 'react';
import { objetosVariosApi } from '../services/objetosVarios';
import { obtenerUnidades } from '../services/unidadesApi';
import { useCarrito, type ItemCarrito } from '../context/CarritoContext';
import type { ObjetoVario } from '../types/objetosVarios';
import ModalObjetoVario from '../components/ModalObjetosVarios';
import type { FiltrosObjetosVarios } from '../types/objetosVarios';
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

  // 🔹 PAGINACIÓN
  const [pagina, setPagina] = useState(1);
  const [limit] = useState(9);
  const [paginacion, setPaginacion] = useState({
    paginaActual: 1,
    totalPaginas: 1,
    totalObjetos: 0,
    hasNext: false,
    hasPrev: false
  });

  // 🔹 FILTROS
  const [filters, setFilters] = useState<Filtros>({
    unidad: 'todas',
    buscar: '',
    fechaInicio: '',
    fechaFin: '',
    usarRango: false
  });

  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { agregarAlCarrito, estaEnCarrito } = useCarrito();

  // 🔹 Agregar al carrito
  const handleAgregarAlCarrito = (objeto: ObjetoVario) => {
    const itemCarrito: ItemCarrito = {
      id: objeto.id,
      tipo: 'objeto',
      nombre: objeto.nombre,
      unidad: objeto.unidad,
    };
    agregarAlCarrito(itemCarrito);
  };

  // 🔹 Cargar unidades
  useEffect(() => {
    const cargarUnidades = async () => {
      try {
        const unidadesData = await obtenerUnidades();
        setUnidades(unidadesData);
      } catch {
        setUnidades([]);
      }
    };
    cargarUnidades();
  }, []);

  // ============================================================
  // 🔹 CARGAR OBJETOS (con filtros y paginación)
  // ============================================================
  const cargarObjetos = useCallback(async () => {
  try {
    setLoading(true);

    const filtrosLimpios: FiltrosObjetosVarios = {};

    if (filters.unidad !== 'todas') filtrosLimpios.unidad = filters.unidad;
    if (filters.buscar.trim() !== '') filtrosLimpios.buscar = filters.buscar;

    if (filters.usarRango) {
      if (filters.fechaInicio) filtrosLimpios.fechaInicio = filters.fechaInicio;
      if (filters.fechaFin) filtrosLimpios.fechaFin = filters.fechaFin;
    } else {
      if (filters.fechaInicio) {
        filtrosLimpios.fechaInicio = filters.fechaInicio;
        filtrosLimpios.fechaFin = filters.fechaInicio;
      }
    }

    // ⚡ Usar página y límite si tienes paginación
    filtrosLimpios.pagina = pagina;  
    filtrosLimpios.limit = limit;

    const res = await objetosVariosApi.obtenerTodos(filtrosLimpios);

    setObjetos(res.data);          // array de objetos
    setPaginacion(res.paginacion); // info de paginación

  } catch (error) {
    console.error('Error cargando objetos varios:', error);
    alert('Error al cargar los objetos varios');
  } finally {
    setLoading(false);
  }
}, [filters, pagina, limit]);


  // 🔹 Recargar cuando cambian filtros o página
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      cargarObjetos();
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [filters, pagina, cargarObjetos]);

  // ============================================================
  // 🔹 HANDLERS
  // ============================================================
  const handleUsarRangoChange = (usarRango: boolean) => {
    setPagina(1);
    setFilters(prev => ({
      ...prev,
      usarRango,
      fechaFin: usarRango ? prev.fechaFin : ""
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
    if (!window.confirm(`¿Eliminar "${objeto.nombre}"?`)) return;

    try {
      await objetosVariosApi.eliminar(objeto.id);
      cargarObjetos();
    } catch {
      alert("Error al eliminar el objeto");
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
    setPagina(1);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLimpiarFiltros = () => {
    setPagina(1);
    setFilters({
      unidad: 'todas',
      buscar: '',
      fechaInicio: '',
      fechaFin: '',
      usarRango: false
    });
  };

  const formatFecha = (fechaString?: string) => {
    if (!fechaString) return "Sin fecha";
    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) return "Fecha inválida";
    return fecha.toLocaleDateString();
  };

  if (loading && objetos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl bg-white p-6 rounded-lg shadow-lg">
          Cargando objetos varios...
        </div>
      </div>
    );
  }

  // ============================================================
  // 🔹 RENDER COMPLETO
  // ============================================================
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ================== FILTROS ================== */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="space-y-4">
            
            {/* FILA 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad
                </label>
                <select
                  value={filters.unidad}
                  onChange={(e) => handleFilterChange("unidad", e.target.value)}
                  className="w-full border rounded-md px-3 py-2 bg-white"
                >
                  <option value="todas">Todas las unidades</option>
                  {unidades.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Buscar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <input
                  type="text"
                  value={filters.buscar}
                  onChange={(e) => handleFilterChange("buscar", e.target.value)}
                  placeholder="Nombre, comentarios..."
                  className="w-full border rounded-md px-3 py-2 bg-white"
                />
              </div>
            </div>

            {/* FILA 2 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* Check rango */}
              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.usarRango}
                    onChange={(e) => handleUsarRangoChange(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Buscar por rango</span>
                </label>
              </div>

              {/* Fecha desde */}
              <div>
                <label className="block text-sm mb-1">
                  {filters.usarRango ? "Fecha desde" : "Fecha específica"}
                </label>
                <input
                  type="date"
                  value={filters.fechaInicio}
                  onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              {/* Fecha hasta */}
              {filters.usarRango && (
                <div>
                  <label className="block text-sm mb-1">Fecha hasta</label>
                  <input
                    type="date"
                    value={filters.fechaFin}
                    onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              )}

              {!filters.usarRango && <div></div>}
            </div>

            {/* FILA 3 */}
            <div className="flex flex-col sm:flex-row justify-between pt-4 border-t">
              <span className="text-sm text-gray-600">
                Total: {paginacion.totalObjetos} objeto(s)
              </span>

              <div className="flex gap-2 mt-3 sm:mt-0">
                <button
                  onClick={handleLimpiarFiltros}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Limpiar filtros
                </button>

                <button
                  onClick={handleCrearObjeto}
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  + Nuevo objeto
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================== LISTA ================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {objetos.map(objeto => {
            const enCarrito = estaEnCarrito(objeto.id);

            return (
              <div key={objeto.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between mb-3">
                  <h3 className="text-lg font-semibold">{objeto.nombre}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {formatFecha(objeto.createdAt)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p><b>Unidad:</b> {objeto.unidad}</p>
                  <p><b>ID:</b> {objeto.id}</p>
                  {objeto.comentarios && <p><b>Comentarios:</b> {objeto.comentarios}</p>}
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditarObjeto(objeto)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleEliminarObjeto(objeto)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <button
                    onClick={() => handleAgregarAlCarrito(objeto)}
                    disabled={enCarrito}
                    className={`w-full px-3 py-2 rounded ${
                      enCarrito
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {enCarrito ? "✓ En Carrito" : "+ Agregar al Carrito"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================== SIN RESULTADOS ================== */}
        {objetos.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-white text-lg">No se encontraron objetos</p>
            <button
              onClick={handleCrearObjeto}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded"
            >
              Crear primer objeto
            </button>
          </div>
        )}

        {/* ================== PAGINACIÓN ================== */}
        <div className="flex justify-center items-center mt-10 gap-4">
          <button
            disabled={!paginacion.hasPrev}
            onClick={() => setPagina(prev => Math.max(1, prev - 1))}
            className={`px-4 py-2 rounded ${
              paginacion.hasPrev
                ? "bg-indigo-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            ← Anterior
          </button>

          <span className="text-white font-medium">
            Página {paginacion.paginaActual} de {paginacion.totalPaginas}
          </span>

          <button
            disabled={!paginacion.hasNext}
            onClick={() => setPagina(prev => prev + 1)}
            className={`px-4 py-2 rounded ${
              paginacion.hasNext
                ? "bg-indigo-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* MODAL */}
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
