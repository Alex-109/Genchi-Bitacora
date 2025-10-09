// src/pages/BusquedaEquipos.tsx
import { useEffect, useMemo, useState } from "react";
import { buscarEquipos, eliminarEquipoApi } from "../services/equiposApi";
import { obtenerUnidades } from "../services/unidadesApi";
import TarjetaEquipo from "../components/TarjetaEquipo";
import type { Equipo, FiltrosPC, FiltrosImpresora } from "../types/equipo";

const TIPOS = ["todos", "pc", "notebook", "impresora"] as const;
type TipoEstado = typeof TIPOS[number];

export default function BusquedaEquipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [paginaActual, setPaginaActual] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [tipoEquipo, setTipoEquipo] = useState<TipoEstado>("pc");
  const [unidades, setUnidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const [filtrosComunes, setFiltrosComunes] = useState({
    marca: "",
    unidad: "",
    fecha: "",
  });

  const [filtrosPC, setFiltrosPC] = useState<FiltrosPC>({
    windows: "10",
    ver_win: "22H2",
    antivirus: "si",
    ram: "",
    cpu: "",
    almacenamiento: "",
    tipoAlmacenamiento: ""
  });

  const [filtrosImpresora, setFiltrosImpresora] = useState<FiltrosImpresora>({
    toner: "",
    drum: "",
    conexion: ""
  });

  // Cargar unidades (transformación ya realizada en service)
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

  // Construir filtros memoizados para evitar re-renderes innecesarios
  const filtrosPayload = useMemo(() => {
    const base: any = {
      tipo_equipo: tipoEquipo === "todos" ? null : tipoEquipo,
      query: query?.trim() || null,
      limit,
      pagina: paginaActual
    };

    if (filtrosComunes.marca) base.marca = filtrosComunes.marca;
    if (filtrosComunes.unidad) base.nombre_unidad = filtrosComunes.unidad;
    if (filtrosComunes.fecha) base.fecha = filtrosComunes.fecha;

    if (tipoEquipo === "pc" || tipoEquipo === "notebook") {
      Object.assign(base, filtrosPC);
    } else if (tipoEquipo === "impresora") {
      Object.assign(base, filtrosImpresora);
    }

    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEquipo, query, limit, paginaActual, filtrosComunes, filtrosPC, filtrosImpresora]);

  // Cargar equipos (fetch centralizado)
  const cargarEquipos = async (opts?: { pagina?: number; resetPage?: boolean }) => {
    const pagina = opts?.pagina ?? paginaActual;
    const resetPage = opts?.resetPage ?? false;
    try {
      setLoading(true);
      setMensajeError(null);
      const payload = { ...filtrosPayload, pagina };
      // si piden resetear paginación, aseguramos enviar pagina=1
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

  // Inicial / cada vez que cambian filtros importantes: reiniciar a página 1
  useEffect(() => {
    setPaginaActual(1);
    cargarEquipos({ pagina: 1, resetPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEquipo, filtrosComunes, filtrosPC, filtrosImpresora, limit]);

  // Búsqueda por texto: debounce simple con timeout
  useEffect(() => {
    const t = setTimeout(() => {
      setPaginaActual(1);
      cargarEquipos({ pagina: 1, resetPage: true });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Handlers
  const handleEliminar = async (id: number) => {
    try {
      await eliminarEquipoApi(id);
      // si la página queda vacía tras eliminar, intentamos retroceder una página si aplica
      const nextReloadPage = equipos.length === 1 && paginaActual > 1 ? paginaActual - 1 : paginaActual;
      cargarEquipos({ pagina: nextReloadPage });
    } catch (err) {
      console.error("Error eliminando equipo:", err);
      setMensajeError("No se pudo eliminar el equipo");
    }
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

  // Render
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top: tabs + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-full shadow-sm px-1 py-1">
          {TIPOS.map((t) => (
            <button
              key={t}
              onClick={() => { setTipoEquipo(t as TipoEstado); }}
              className={
                `px-4 py-2 rounded-full text-sm font-medium transition 
                ${tipoEquipo === t ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"}`
              }
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
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>
        </div>
      </div>

      {/* Filtros panel */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-3 flex-wrap">
            <select
              value={filtrosComunes.marca}
              onChange={(e) => setFiltrosComunes({ ...filtrosComunes, marca: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
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
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Unidad (Todos)</option>
              <option value="Otros">Otros</option>
              {unidades.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>

            <input
              type="date"
              value={filtrosComunes.fecha}
              onChange={(e) => setFiltrosComunes({ ...filtrosComunes, fecha: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Mostrar</label>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-2 py-1 border rounded-lg text-sm"
            >
              {[6, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button
              onClick={() => { setFiltrosComunes({ marca: "", unidad: "", fecha: "" }); setFiltrosPC({ ...filtrosPC, ram:"", cpu:"", almacenamiento:"", tipoAlmacenamiento:"" }); setFiltrosImpresora({ toner:"", drum:"", conexion:"" }); setQuery(""); }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Filtros específicos */}
        {(tipoEquipo === "pc" || tipoEquipo === "notebook") && (
          <div className="mt-4 flex gap-3 flex-wrap">
            <select
              value={filtrosPC.windows}
              onChange={(e) => setFiltrosPC({ ...filtrosPC, windows: e.target.value as any })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="10">Windows 10</option>
              <option value="11">Windows 11</option>
            </select>

            <select
              value={filtrosPC.ver_win}
              onChange={(e) => setFiltrosPC({ ...filtrosPC, ver_win: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              {filtrosPC.windows === "10" ? (
                <>
                  <option value="19H2">19H2</option>
                  <option value="20H2">20H2</option>
                  <option value="21H2">21H2</option>
                  <option value="22H2">22H2</option>
                </>
              ) : (
                <>
                  <option value="22H2">22H2</option>
                  <option value="23H2">23H2</option>
                  <option value="24H2">24H2</option>
                </>
              )}
            </select>

            <select
              value={filtrosPC.antivirus}
              onChange={(e) => setFiltrosPC({ ...filtrosPC, antivirus: e.target.value as any })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>

            <select
              value={filtrosPC.ram}
              onChange={(e) => setFiltrosPC({ ...filtrosPC, ram: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">RAM</option>
              {["2","4","6","8","10","12","16","Otros"].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <select
              value={filtrosPC.cpu}
              onChange={(e) => setFiltrosPC({ ...filtrosPC, cpu: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">CPU</option>
              {["i3","i5","i7","Otros"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filtrosPC.almacenamiento}
              onChange={(e) => setFiltrosPC({ ...filtrosPC, almacenamiento: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Almacenamiento</option>
              {["250","500","1TB","Otros"].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>

            <select
              value={filtrosPC.tipoAlmacenamiento}
              onChange={(e) => setFiltrosPC({ ...filtrosPC, tipoAlmacenamiento: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Tipo almacenamiento</option>
              {["SSD","HDD","NVMe"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}

        {tipoEquipo === "impresora" && (
          <div className="mt-4 flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Toner"
              value={filtrosImpresora.toner}
              onChange={(e) => setFiltrosImpresora({ ...filtrosImpresora, toner: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Drum"
              value={filtrosImpresora.drum}
              onChange={(e) => setFiltrosImpresora({ ...filtrosImpresora, drum: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <select
              value={filtrosImpresora.conexion}
              onChange={(e) => setFiltrosImpresora({ ...filtrosImpresora, conexion: e.target.value as any })}
              className="px-3 py-2 border rounded-lg text-sm"
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
                onEliminar={handleEliminar}
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
            className={`px-3 py-1 rounded-md ${paginaActual === 1 ? "text-gray-300" : "bg-white border shadow-sm"}`}
          >
            Anterior
          </button>

          <div className="hidden md:flex items-center gap-2">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).slice(0, 10).map((p) => (
              <button
                key={p}
                onClick={() => handleGotoPage(p)}
                className={`px-3 py-1 rounded-md ${paginaActual === p ? "bg-indigo-600 text-white shadow-lg" : "bg-white border"}`}
              >
                {p}
              </button>
            ))}
            {totalPaginas > 10 && <span className="text-sm text-gray-500 px-2">... {totalPaginas} páginas</span>}
          </div>

          <button
            onClick={() => handleGotoPage(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className={`px-3 py-1 rounded-md ${paginaActual === totalPaginas ? "text-gray-300" : "bg-white border shadow-sm"}`}
          >
            Siguiente
          </button>
        </div>

        <div className="text-sm text-gray-600">Página {paginaActual} de {totalPaginas}</div>
      </div>
    </div>
  );
}
