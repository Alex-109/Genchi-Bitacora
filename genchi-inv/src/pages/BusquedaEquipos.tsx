// src/pages/BusquedaEquipos.tsx
import { useEffect, useMemo, useState } from "react";
import { buscarEquipos, eliminarEquipoApi } from "../services/equiposApi";
import { obtenerUnidades } from "../services/unidadesApi";
import TarjetaEquipo from "../components/TarjetaEquipo";
import ModalConfirmacion from "../components/ModalConfirmacion";
import type { Equipo, FiltrosPC, FiltrosImpresora } from "../types/equipo";

const TIPOS = ["todos", "pc", "notebook", "impresora"] as const;
type TipoEstado = typeof TIPOS[number];

export default function BusquedaEquipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [paginaActual, setPaginaActual] = useState(1);
  const [limit, setLimit] = useState(6);
  const [query, setQuery] = useState("");
  const [tipoEquipo, setTipoEquipo] = useState<TipoEstado>("todos");
  const [unidades, setUnidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Modal de confirmación
  const [equipoAEliminar, setEquipoAEliminar] = useState<Equipo | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Estados para Filtro de Fechas
  const [buscarPorRango, setBuscarPorRango] = useState(false); 
  
  const [filtrosComunes, setFiltrosComunes] = useState({
    marca: "",
    unidad: "",
    fechaInicio: "", 
    fechaFin: "",    
  });

  const [filtrosPC, setFiltrosPC] = useState<FiltrosPC>({
    ram: "",
    cpu: "",
    almacenamiento: "",
    tipo_almacenamiento: ""
  });

  const [filtrosImpresora, setFiltrosImpresora] = useState<FiltrosImpresora>({
    toner: "",
    drum: "",
    conexion: ""
  });

  // Cargar unidades disponibles
  useEffect(() => {
    let mounted = true;
    const cargarUnidades = async () => {
      try {
        const data = await obtenerUnidades();
        if (!mounted) return;
        setUnidades(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error obteniendo unidades:", err);
        if (mounted) setUnidades([]);
      }
    };
    cargarUnidades();
    return () => { mounted = false; };
  }, []);

  // Construir payload de filtros
  const filtrosPayload = useMemo(() => {
    const base: any = {
      tipo_equipo: tipoEquipo === "todos" ? null : tipoEquipo,
      query: query?.trim() || null,
      limit,
      pagina: paginaActual,
    };

    if (filtrosComunes.marca) base.marca = filtrosComunes.marca;
    if (filtrosComunes.unidad) base.nombre_unidad = filtrosComunes.unidad;

    // LÓGICA CORREGIDA DE FILTRO DE FECHAS - USANDO LOS NOMBRES QUE ESPERA LA API
    if (buscarPorRango) {
      // MODO RANGO: Usa fechaInicio y fechaFin como espera la API
      if (filtrosComunes.fechaInicio) base.fechaInicio = filtrosComunes.fechaInicio;
      if (filtrosComunes.fechaFin) base.fechaFin = filtrosComunes.fechaFin;
    } else {
      // MODO DÍA ÚNICO: Para buscar en un día específico, usamos la misma fecha en inicio y fin
      if (filtrosComunes.fechaInicio) {
        base.fechaInicio = filtrosComunes.fechaInicio;
        base.fechaFin = filtrosComunes.fechaInicio; // Misma fecha para buscar solo ese día
      }
    }
    // ------------------------------------

    if (tipoEquipo === "pc" || tipoEquipo === "notebook") {
      Object.assign(base, {
        ...filtrosPC,
        tipo_almacenamiento: filtrosPC.tipo_almacenamiento || undefined,
      });
      delete base.tipoAlmacenamiento;
    } else if (tipoEquipo === "impresora") {
      Object.assign(base, filtrosImpresora);
    }

    // Limpiar campos undefined o null
    Object.keys(base).forEach(key => {
      if (base[key] === null || base[key] === undefined || base[key] === '') {
        delete base[key];
      }
    });

    return base;
  }, [tipoEquipo, query, limit, paginaActual, filtrosComunes, filtrosPC, filtrosImpresora, buscarPorRango]);

  // Cargar equipos
  const cargarEquipos = async (opts?: { pagina?: number; resetPage?: boolean }) => {
    const pagina = opts?.pagina ?? paginaActual;
    const resetPage = opts?.resetPage ?? false;
    try {
      setLoading(true);
      setMensajeError(null);
      const payload = { ...filtrosPayload, pagina };
      if (resetPage) payload.pagina = 1;
      const res = await buscarEquipos(payload);
      const data = res?.data;
      setEquipos(Array.isArray(data?.equipos) ? data.equipos : []);
      setTotalPaginas(typeof data?.totalPaginas === "number" ? data.totalPaginas : 1);
      setPaginaActual(typeof data?.paginaActual === "number" ? data.paginaActual : pagina);
    } catch (err: any) {
      console.error("Error cargando equipos:", err);
      setMensajeError(err?.response?.data?.mensaje || "Error al obtener equipos");
    } finally {
      setLoading(false);
    }
  };

  // ✅ EFECTO ÚNICO - Reemplaza los dos useEffect anteriores
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPaginaActual(1);
      cargarEquipos({ pagina: 1, resetPage: true });
    }, query ? 400 : 0); // Sin delay si query está vacío (carga inicial)

    return () => clearTimeout(timeoutId);
  }, [tipoEquipo, filtrosComunes, filtrosPC, filtrosImpresora, limit, buscarPorRango, query]);

  // --- Manejo de eliminación ---
  const handleClickEliminar = (equipo: Equipo) => {
    setEquipoAEliminar(equipo);
    setMostrarModal(true);
  };

  const confirmarEliminar = async () => {
  if (!equipoAEliminar) return;
  
  try {
    const response = await eliminarEquipoApi(equipoAEliminar.id!);
    
    // ✅ VERIFICAR SI FUE EXITOSO (status 200)
    if (response.status === 200) {
      setMostrarModal(false);
      setEquipoAEliminar(null);
      
      // ✅ RECARGAR INMEDIATAMENTE
      const nextPage = equipos.length === 1 && paginaActual > 1 ? paginaActual - 1 : paginaActual;
      await cargarEquipos({ pagina: nextPage });
      
      // ✅ LIMPIAR MENSAJES DE ERROR
      setMensajeError(null);
    } else {
      // Si el status no es 200, considerar como error
      throw new Error(`Error del servidor: ${response.status}`);
    }
    
  } catch (err: any) {
    console.error("Error eliminando equipo:", err);
    
    // ✅ MENSAJE MÁS ESPECÍFICO
    let errorMessage = "No se pudo eliminar el equipo";
    
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setMensajeError(errorMessage);
    
    // ✅ CERRAR MODAL DE TODAS FORMAS
    setMostrarModal(false);
    setEquipoAEliminar(null);
    
    // ✅ RECARGAR LA LISTA POR SI ACASO SÍ SE ELIMINÓ
    setTimeout(() => {
      cargarEquipos({ pagina: paginaActual });
    }, 500);
  }
};

  const cancelarEliminar = () => {
    setMostrarModal(false);
    setEquipoAEliminar(null);
  };

  const handleGotoPage = (p: number) => {
    if (p < 1 || p > totalPaginas || p === paginaActual) return;
    setPaginaActual(p);
    cargarEquipos({ pagina: p });
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPaginaActual(1);
  };
  
  // Función de limpieza para filtros comunes, incluyendo las fechas
  const handleLimpiarFechas = () => {
    setFiltrosComunes(prev => ({ ...prev, fechaInicio: "", fechaFin: "" }));
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Tabs + búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-full shadow-sm px-1 py-1">
          {TIPOS.map((t) => (
            <button
              key={t}
              onClick={() => setTipoEquipo(t as TipoEstado)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition 
                ${tipoEquipo === t
                  ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"}`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex-1 md:ml-6">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por número de inventario, serie, IP o nombre..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white"
            />
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex gap-3 flex-wrap items-end">
            <select
              value={filtrosComunes.marca}
              onChange={(e) => setFiltrosComunes({ ...filtrosComunes, marca: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">Marca (Todos)</option>
              <option value="Otros">Otros</option>
              <option value="Dell">Dell</option>
              <option value="HP">HP</option>
              <option value="Lenovo">Lenovo</option>
            </select>

            <select
              value={filtrosComunes.unidad}
              onChange={(e) => setFiltrosComunes({ ...filtrosComunes, unidad: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">Unidad (Todos)</option>
              <option value="Otros">Otros</option>
              {unidades.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>

            {/* 📅 FILTRO DE FECHAS CORREGIDO - Ahora en línea con los otros filtros */}
            <div className="flex items-end gap-2">
              {/* Checkbox de rango */}
              <div className="flex items-center gap-2 h-10 px-3 border border-gray-200 rounded-lg bg-white">
                <label htmlFor="rango-checkbox" className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <span className="text-xs text-gray-500 select-none">Rango de fechas</span>
                  <input
                    type="checkbox"
                    id="rango-checkbox"
                    checked={buscarPorRango}
                    onChange={(e) => {
                      setBuscarPorRango(e.target.checked);
                      handleLimpiarFechas(); 
                    }}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </label>
              </div>

              {/* Input de fecha inicial */}
              <div className="flex flex-col">
                <label htmlFor="fecha-inicio" className="text-xs text-gray-500 font-medium mb-1">
                  {buscarPorRango ? 'Desde' : 'Fecha'}
                </label>
                <input
                  id="fecha-inicio"
                  type="date"
                  value={filtrosComunes.fechaInicio}
                  onChange={(e) => setFiltrosComunes({ ...filtrosComunes, fechaInicio: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm bg-white hover:border-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition w-40"
                />
              </div>
              
              {/* Input de fecha final (solo visible en modo rango) */}
              {buscarPorRango && (
                <div className="flex flex-col">
                  <label htmlFor="fecha-fin" className="text-xs text-gray-500 font-medium mb-1">
                    Hasta
                  </label>
                  <input
                    id="fecha-fin"
                    type="date"
                    value={filtrosComunes.fechaFin}
                    onChange={(e) => setFiltrosComunes({ ...filtrosComunes, fechaFin: e.target.value })}
                    className="px-3 py-2 border rounded-lg text-sm bg-white hover:border-indigo-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition w-40"
                  />
                </div>
              )}
            </div>
            {/* FIN FILTRO DE FECHAS CORREGIDO */}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Mostrar</label>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-2 py-1 border rounded-lg text-sm bg-white"
            >
              {[6, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button
              onClick={() => {
                setFiltrosComunes({ marca: "", unidad: "", fechaInicio: "", fechaFin: "" });
                setFiltrosPC({ ram: "", cpu: "", almacenamiento: "", tipo_almacenamiento: "" });
                setFiltrosImpresora({ toner: "", drum: "", conexion: "" });
                setQuery("");
                setBuscarPorRango(false); // Reinicia el modo de búsqueda
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Filtros PC / Notebook */}
        {(tipoEquipo === "pc" || tipoEquipo === "notebook") && (
          <div className="mt-4 bg-white rounded-xl shadow p-4 flex gap-3 flex-wrap">
            <select
              value={filtrosPC.ram}
              onChange={(e) => setFiltrosPC({ ...filtrosPC, ram: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">RAM</option>
              {["2","4","6","8","10","12","16","Otros"].map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select
              value={filtrosPC.cpu}
              onChange={(e) => setFiltrosPC({ ...filtrosPC, cpu: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">CPU</option>
              {["i3","i5","i7","Otros"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filtrosPC.almacenamiento}
              onChange={(e) => setFiltrosPC({ ...filtrosPC, almacenamiento: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">Almacenamiento</option>
              {["250","256","500","512","1000","Otros"].map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <select
              value={filtrosPC.tipo_almacenamiento}
              onChange={(e) => setFiltrosPC({ ...filtrosPC, tipo_almacenamiento: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">Tipo almacenamiento</option>
              {["SSD","HDD","NVMe"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}

        {/* Filtros Impresora */}
        {tipoEquipo === "impresora" && (
          <div className="mt-4 bg-white rounded-xl shadow p-4 flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Toner"
              value={filtrosImpresora.toner}
              onChange={(e) => setFiltrosImpresora({ ...filtrosImpresora, toner: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            />
            <input
              type="text"
              placeholder="Drum"
              value={filtrosImpresora.drum}
              onChange={(e) => setFiltrosImpresora({ ...filtrosImpresora, drum: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            />
            <select
              value={filtrosImpresora.conexion}
              onChange={(e) => setFiltrosImpresora({ ...filtrosImpresora, conexion: e.target.value as any })}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">Conexión</option>
              <option value="wifi">WiFi</option>
              <option value="ethernet">Ethernet</option>
              <option value="usb">USB</option>
            </select>
          </div>
        )}
      </div>

    {/* Resultados */}
    <div className="mt-6">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-300 border-t-indigo-600 rounded-full" />
        </div>
      ) : mensajeError ? (
        <div className="text-center text-red-600 py-8">{mensajeError}</div>
      ) : equipos.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No se encontraron equipos.</div>
    ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipos.map((equipo) => (
            <TarjetaEquipo
              key={equipo.id}
              equipo={equipo}
              onEliminar={handleClickEliminar}
              onActualizarLista={() => cargarEquipos({ pagina: paginaActual })}
            />
          ))}
        </div>
      )}
    </div>

    {/* Paginación */}
    <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleGotoPage(paginaActual - 1)}
          disabled={paginaActual === 1}
          className={`px-3 py-1 rounded-md ${paginaActual === 1 ? "text-gray-300 bg-gray-100" : "bg-white border shadow-sm"}`}
        >
          Anterior
        </button>

        <div className="hidden md:flex items-center gap-2">
          {/* Ventana de paginación: mostramos una ventana centrada en la página actual, con primer/último y ellipsis */}
          {(() => {
            const pageWindow = 5; // número máximo de botones interiores
            const half = Math.floor(pageWindow / 2);
            let start = Math.max(1, paginaActual - half);
            let end = Math.min(totalPaginas, paginaActual + half);

            // ajustar si estamos cerca del inicio o del final
            if (end - start + 1 < pageWindow) {
              if (start === 1) {
                end = Math.min(totalPaginas, start + pageWindow - 1);
              } else if (end === totalPaginas) {
                start = Math.max(1, end - pageWindow + 1);
              }
            }

            const nodes: React.ReactNode[] = [];

            // primer botón
            if (start > 1) {
              nodes.push(
                <button
                  key={1}
                  onClick={() => handleGotoPage(1)}
                  className={`px-3 py-1 rounded-md ${paginaActual === 1 ? "bg-indigo-500 text-white" : "bg-white border shadow-sm"}`}
                >
                  1
                </button>
              );
              if (start > 2) {
                nodes.push(
                  <span key="left-ellipsis" className="px-2 text-sm text-gray-500">…</span>
                );
              }
            }

            for (let p = start; p <= end; p++) {
              nodes.push(
                <button
                  key={p}
                  onClick={() => handleGotoPage(p)}
                  className={`px-3 py-1 rounded-md ${paginaActual === p ? "bg-indigo-500 text-white" : "bg-white border shadow-sm"}`}
                >
                  {p}
                </button>
              );
            }

            if (end < totalPaginas) {
              if (end < totalPaginas - 1) {
                nodes.push(
                  <span key="right-ellipsis" className="px-2 text-sm text-gray-500">…</span>
                );
              }
              nodes.push(
                <button
                  key={totalPaginas}
                  onClick={() => handleGotoPage(totalPaginas)}
                  className={`px-3 py-1 rounded-md ${paginaActual === totalPaginas ? "bg-indigo-500 text-white" : "bg-white border shadow-sm"}`}
                >
                  {totalPaginas}
                </button>
              );
            }

            return nodes;
          })()}
        </div>

        <button
          onClick={() => handleGotoPage(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className={`px-3 py-1 rounded-md ${paginaActual === totalPaginas ? "text-gray-300 bg-gray-100" : "bg-white border shadow-sm"}`}
        >
          Siguiente
        </button>
      </div>

      <div className="text-sm text-gray-500">
        Página {paginaActual} de {totalPaginas}
      </div>
    </div>

    {/* El modal usa las funciones de confirmar y cancelar */}
    <ModalConfirmacion
      show={mostrarModal}
      mensaje={`¿Eliminar el equipo ${equipoAEliminar?.nombre_equipo || equipoAEliminar?.tipo_equipo}?`}
      onConfirm={confirmarEliminar}
      onCancel={cancelarEliminar}
    />
  </div>
  );
}