import { useState } from "react";
import type { Equipo, HistorialIngreso } from "../types/equipo"; 
import ModalHistorial from "./ModalHistorial";
import ModalReparacion from "./ModalReparacion";
import BotonIngreso from "./BotonIngreso";
import { format } from "date-fns";
import { usePerfil } from "../context/PerfilContext";
import { useCarrito } from "../context/CarritoContext";

interface Props {
  equipo: Equipo;
  onEliminar: (equipo: Equipo) => void;
  onActualizarLista: () => void;
}

// 🛠️ Función auxiliar para formatear fechas (maneja string | undefined)
const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "—";
    try {
        return format(new Date(dateString), "dd-MM-yyyy");
    } catch {
        return "—";
    }
}

/**
 * Obtiene la fecha más reciente de un array de HistorialIngreso.
 * @param historial El arreglo de ingresos del equipo.
 * @returns La fecha del último ingreso formateada o un guión.
 */
const getFechaUltimoIngreso = (historial: HistorialIngreso[] | undefined): string => {
    if (!historial || historial.length === 0) {
        return "—";
    }

    const historialOrdenado = [...historial].sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    return formatDate(historialOrdenado[0].fecha);
}

// Funciones auxiliares para atributos
const AtributosComunes = ({ equipo }: { equipo: Equipo }) => (
  <>
    <p><span className="font-semibold">Marca:</span> {equipo.marca || "—"}</p>
    <p><span className="font-semibold">Modelo:</span> {equipo.modelo || "—"}</p>
    <p><span className="font-semibold">Serie:</span> {equipo.serie || "—"}</p> 
    <p><span className="font-semibold">Num Inv:</span> {equipo.num_inv || "—"}</p> 
    <p><span className="font-semibold">Unidad:</span> {equipo.nombre_unidad || "—"}</p>
    <p><span className="font-semibold">IP:</span> {equipo.ip || "—"}</p>
  </>
);

const AtributosPC = ({ equipo }: { equipo: Equipo }) => (
  <>
    <p><span className="font-semibold">Usuario:</span> {equipo.nombre_usuario || "—"}</p>
    <p><span className="font-semibold">Windows:</span> {equipo.windows || "—"} {equipo.ver_win || ""}</p>
    <p><span className="font-semibold">Antivirus:</span> {equipo.antivirus || "—"}</p>
    <p><span className="font-semibold">CPU:</span> {equipo.cpu || "—"}</p>
    <p><span className="font-semibold">RAM:</span> {equipo.ram ? `${equipo.ram} GB` : "—"}</p>
    <p><span className="font-semibold">Almacenamiento:</span> {equipo.almacenamiento ? `${equipo.almacenamiento} (${equipo.tipo_almacenamiento || ""})` : "—"}</p>
  </>
);

const AtributosImpresora = ({ equipo }: { equipo: Equipo }) => (
  <>
    <p><span className="font-semibold">Toner:</span> {equipo.toner || "—"}</p>
    <p><span className="font-semibold">Drum:</span> {equipo.drum || "—"}</p>
    <p><span className="font-semibold">Conexión:</span> {equipo.conexion || "—"}</p>
  </>
);

export default function TarjetaEquipo({ equipo, onEliminar, onActualizarLista }: Props) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarReparacion, setMostrarReparacion] = useState(false);
  const [agregandoAlCarrito, setAgregandoAlCarrito] = useState(false);
  
  const { perfilSeleccionado } = usePerfil();
  const { agregarAlCarrito, estaEnCarrito } = useCarrito();

  const gridColsClass = "grid-cols-1 md:grid-cols-2";

  const estado = (equipo?.estado ?? "entregado").toString().toLowerCase();
  
  // ✅ DETECTAR SI ESTÁ EN REPARACIÓN
  const isInRepairProcess = estado.includes("proceso") || estado.includes("espera");
  // ✅ DETECTAR SI ESTÁ ENTREGADO (puede ir al carrito)
  const isDelivered = estado.includes("entregado");

  const borderClass = isInRepairProcess ? "border-orange-400" : "border-indigo-300";
  const headerBgClass = isInRepairProcess ? "bg-orange-50" : "bg-indigo-50";
  const badgeClass = isInRepairProcess ? "bg-orange-600 text-white" : "bg-indigo-600 text-white";

  let estadoTexto = "ENTREGADO";
  if (estado.includes("proceso")) {
    estadoTexto = "EN PROCESO";
  } else if (estado.includes("espera")) {
    estadoTexto = "ESPERANDO REPUESTO";
  }

  const reparacionDisabled = !isInRepairProcess;
  const fechaUltimoIngreso = getFechaUltimoIngreso(equipo.historial_ingresos);

  // ✅ NUEVA FUNCIÓN: Agregar al carrito en lugar de generar acta
  const handleAgregarAlCarrito = async () => {
    if (!equipo.id) return;
    
    setAgregandoAlCarrito(true);
    try {
      const itemCarrito = {
        id: equipo.id,
        tipo: 'equipo' as const,
        tipo_equipo: equipo.tipo_equipo,
        modelo: equipo.modelo,
        marca: equipo.marca,
        nombre_unidad: equipo.nombre_unidad,
        serie: equipo.serie,
        num_inv: equipo.num_inv,
        ip: equipo.ip,
        nombre_usuario: equipo.nombre_usuario,
      };
      
      agregarAlCarrito(itemCarrito);
      
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      alert('Error al agregar al carrito');
    } finally {
      setAgregandoAlCarrito(false);
    }
  };

  const enCarrito = estaEnCarrito(equipo.id!);
  // ✅ BLOQUEAR BOTÓN SI ESTÁ EN REPARACIÓN O YA ESTÁ EN CARRITO
  const carritoDisabled = !isDelivered || enCarrito || agregandoAlCarrito;

  return (
    <>
      <div className={`relative p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-2 ${borderClass} flex flex-col h-full overflow-hidden`}>
        
        <div className="absolute top-1 right-3 z-20 flex items-center gap-2"> 
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeClass} select-none whitespace-nowrap`}>
            {estadoTexto}
          </span>

          <BotonIngreso
            equipo={equipo}
            onIngresoRegistrado={onActualizarLista}
          />
        </div>

        <div className={`${headerBgClass} -mx-4 px-4 py-4 mb-3 rounded-t-lg`}> 
          <h2 className="font-extrabold text-xl text-gray-800 pr-[140px] truncate mt-2"> 
            {equipo.nombre_equipo || equipo.tipo_equipo?.toUpperCase()}
          </h2>
          
          <p className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
            <span className="font-bold text-indigo-700">ID: {equipo.id}</span>
            <span className="font-medium text-gray-600">Creado: {formatDate(equipo.createdAt)}</span>
            <span className="font-medium text-gray-600">Último Ingreso: {fechaUltimoIngreso}</span>
          </p>
        </div>

        <div className={`grid ${gridColsClass} gap-y-1 gap-x-6 text-sm mb-4 flex-grow`}>
          <AtributosComunes equipo={equipo} />
          {(equipo.tipo_equipo === "pc" || equipo.tipo_equipo === "notebook") && <AtributosPC equipo={equipo} />}
          {equipo.tipo_equipo === "impresora" && <AtributosImpresora equipo={equipo} />}
        </div>

        {equipo.comentarios && (
          <div className="mt-2 mb-4 p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-md text-gray-700 text-sm shadow-inner">
            <p className="font-bold text-blue-700 mb-1 flex items-center gap-1">📝 Comentarios:</p>
            <p className="whitespace-pre-wrap">{equipo.comentarios}</p>
          </div>
        )}

        {/* BOTONES EN UNA SOLA FILA - AJUSTADO */}
        <div className="mt-4 pt-3 border-t flex gap-2 justify-end items-center">
          {/* ✅ BOTÓN MODIFICADO: Solo disponible si está ENTREGADO */}
          <button
            className={`text-white px-3 py-1 text-xs font-medium rounded-full transition-colors shadow-md min-w-[80px] ${
              carritoDisabled 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleAgregarAlCarrito}
            disabled={carritoDisabled}
            title={
              !isDelivered ? "Solo equipos ENTREGADOS pueden ir al carrito" :
              enCarrito ? "Ya está en el carrito" : 
              "Agregar al carrito para generar acta"
            }
          >
            {agregandoAlCarrito ? "⏳..." : 
             enCarrito ? "✅ En Carrito" : 
             !isDelivered ? "🚫 No Disponible" : 
             "🛒 Carrito"}
          </button>

          {/* Botón Reparación - más compacto */}
          <button
            className={`text-white px-3 py-1 text-xs font-medium rounded-full transition-colors shadow-md min-w-[80px] ${
              reparacionDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={() => {
              if (reparacionDisabled) return;
              setMostrarReparacion(true);
            }}
            disabled={reparacionDisabled}
            title={reparacionDisabled ? "Debe estar en proceso para reparar" : "Iniciar / editar reparación"}
          >
            🛠️ Reparación
          </button>

          {/* Botón Historial - más compacto */}
          <button
            className="bg-yellow-600 text-white px-3 py-1 text-xs font-medium rounded-full hover:bg-yellow-700 transition-colors shadow-md min-w-[70px]"
            onClick={() => setMostrarHistorial(true)}
          >
            📜 Historial
          </button>

          {/* Botón Eliminar - más compacto */}
          <button
            className="bg-red-600 text-white px-3 py-1 text-xs font-medium rounded-full hover:bg-red-700 transition-colors shadow-md min-w-[70px]"
            onClick={() => onEliminar(equipo)}
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {mostrarHistorial && (
        <ModalHistorial
          idEquipo={equipo.id!}
          onClose={() => setMostrarHistorial(false)}
        />
      )}

      {mostrarReparacion && (
        <ModalReparacion
          equipo={equipo}
          onClose={() => setMostrarReparacion(false)}
          onReparacionExitosa={onActualizarLista}
        />
      )}
    </>
  );
}