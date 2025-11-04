import { useState } from "react";
import type { Equipo, HistorialIngreso } from "../types/equipo"; 
import ModalHistorial from "./ModalHistorial";
import ModalReparacion from "./ModalReparacion";
import BotonIngreso from "./BotonIngreso";
import { format } from "date-fns";
import { generarActaEntrega } from "../services/actaApi"; // Importar el servicio

interface Props {
  equipo: Equipo;
  onEliminar: (equipo: Equipo) => void;
  onActualizarLista: () => void;
}

// 🛠️ Función auxiliar para formatear fechas (maneja string | undefined)
const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "—";
    try {
        // Usamos date-fns para formato consistente y seguro
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

    // 1. Ordenar el historial por fecha descendente (la más nueva primero)
    const historialOrdenado = [...historial].sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    // 2. Tomar la fecha del primer elemento (el más reciente)
    return formatDate(historialOrdenado[0].fecha);
}

// Funciones auxiliares para atributos
const AtributosComunes = ({ equipo }: { equipo: Equipo }) => (
  <>
    <p><span className="font-semibold">Marca:</span> {equipo.marca}</p>
    <p><span className="font-semibold">Modelo:</span> {equipo.modelo}</p>
    <p><span className="font-semibold">Serie:</span> {equipo.serie}</p> 
    <p><span className="font-semibold">Num Inv:</span> {equipo.num_inv}</p> 
    <p><span className="font-semibold">Unidad:</span> {equipo.nombre_unidad}</p>
    <p><span className="font-semibold">IP:</span> {equipo.ip}</p>
  </>
);

const AtributosPC = ({ equipo }: { equipo: Equipo }) => (
  <>
    <p><span className="font-semibold">Usuario:</span> {equipo.nombre_usuario}</p>
    <p><span className="font-semibold">Windows:</span> {equipo.windows} {equipo.ver_win}</p>
    <p><span className="font-semibold">Antivirus:</span> {equipo.antivirus}</p>
    <p><span className="font-semibold">CPU:</span> {equipo.cpu}</p>
    <p><span className="font-semibold">RAM:</span> {equipo.ram ? `${equipo.ram} GB` : ""}</p>
    <p><span className="font-semibold">Almacenamiento:</span> {equipo.almacenamiento} ({equipo.tipo_almacenamiento})</p>
  </>
);

const AtributosImpresora = ({ equipo }: { equipo: Equipo }) => (
  <>
    <p><span className="font-semibold">Toner:</span> {equipo.toner}</p>
    <p><span className="font-semibold">Drum:</span> {equipo.drum}</p>
    <p><span className="font-semibold">Conexión:</span> {equipo.conexion}</p>
  </>
);

export default function TarjetaEquipo({ equipo, onEliminar, onActualizarLista }: Props) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarReparacion, setMostrarReparacion] = useState(false);
  const [generandoActa, setGenerandoActa] = useState(false); // Estado para el loading del acta

  const gridColsClass = "grid-cols-2";

  // 1. Determinación y Estandarización del estado
  const estado = (equipo?.estado ?? "entregado").toString().toLowerCase();
  
  // 2. Definición de clases visuales dinámicas
  const isInRepairProcess = estado.includes("proceso") || estado.includes("espera");

  // Clases basadas en estado (Entregado vs. En Proceso/Espera)
  const borderClass = isInRepairProcess ? "border-orange-400" : "border-indigo-300";
  const headerBgClass = isInRepairProcess ? "bg-orange-50" : "bg-indigo-50";
  const badgeClass = isInRepairProcess ? "bg-orange-600 text-white" : "bg-indigo-600 text-white";

  // Mapeo del texto de estado para el badge
  let estadoTexto = "ENTREGADO";
  if (estado.includes("proceso")) {
    estadoTexto = "EN PROCESO";
  } else if (estado.includes("espera")) {
    estadoTexto = "ESPERANDO REPUESTO";
  }

  // Habilitar el botón de reparación: solo si está en PROCESO o ESPERA.
  const reparacionDisabled = !isInRepairProcess;

  // Obtener la fecha del último ingreso
  const fechaUltimoIngreso = getFechaUltimoIngreso(equipo.historial_ingresos);

  // Función para generar el acta de entrega
  const handleGenerarActa = async () => {
    if (!equipo.id) return;
    
    setGenerandoActa(true);
    try {
      await generarActaEntrega(equipo.id);
    } catch (error) {
      console.error('Error generando acta:', error);
      alert('Error al generar el acta de entrega');
    } finally {
      setGenerandoActa(false);
    }
  };

  return (
    <>
      <div className={`relative p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-2 ${borderClass} flex flex-col h-full overflow-hidden`}>
        
        {/* 🛑 AJUSTE DE POSICIÓN: top-1 para evitar superposición con el título */}
        <div className="absolute top-1 right-3 z-20 flex items-center gap-2"> 
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeClass} select-none whitespace-nowrap`}>
            {estadoTexto}
          </span>

          <BotonIngreso
            equipo={equipo}
            onIngresoRegistrado={onActualizarLista}
          />
        </div>

        {/* ENCABEZADO: py-4 para dar espacio al elemento absolute */}
        <div className={`${headerBgClass} -mx-4 px-4 py-4 mb-3 rounded-t-lg`}> 
          <h2 className="font-extrabold text-xl text-gray-800 pr-[140px] truncate mt-2"> 
            {equipo.nombre_equipo || equipo.tipo_equipo?.toUpperCase()}
          </h2>
          
          {/* ID, Fecha de Creación y Último Ingreso */}
          <p className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
            <span className="font-bold text-indigo-700">ID: {equipo.id}</span>
            <span className="font-medium text-gray-600">Creado: {formatDate(equipo.createdAt)}</span>
            <span className="font-medium text-gray-600">Último Ingreso: {fechaUltimoIngreso}</span>
          </p>
        </div>

        {/* Contenedor de Atributos */}
        <div className={`grid ${gridColsClass} gap-y-1 gap-x-6 text-sm mb-4 flex-grow`}>
          <AtributosComunes equipo={equipo} />
          {(equipo.tipo_equipo === "pc" || equipo.tipo_equipo === "notebook") && <AtributosPC equipo={equipo} />}
          {equipo.tipo_equipo === "impresora" && <AtributosImpresora equipo={equipo} />}
        </div>

        {/* Comentarios */}
        {equipo.comentarios && (
          <div className="mt-2 mb-4 p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-md text-gray-700 text-sm shadow-inner">
            <p className="font-bold text-blue-700 mb-1 flex items-center gap-1">📝 Comentarios:</p>
            <p className="whitespace-pre-wrap">{equipo.comentarios}</p>
          </div>
        )}

        {/* Botones inferiores */}
        <div className="mt-4 pt-3 border-t flex gap-3 justify-end">
          {/* NUEVO BOTÓN: Generar Acta de Entrega */}
          <button
            className={`text-white px-3 py-1 text-sm font-medium rounded-full transition-colors shadow-md ${
              generandoActa ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleGenerarActa}
            disabled={generandoActa}
            title="Generar acta de entrega"
          >
            {generandoActa ? "⏳ Generando..." : "📄 Acta"}
          </button>

          <button
            className={`text-white px-3 py-1 text-sm font-medium rounded-full transition-colors shadow-md ${
              reparacionDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={() => {
              if (reparacionDisabled) return;
              setMostrarReparacion(true);
            }}
            aria-disabled={reparacionDisabled}
            title={reparacionDisabled ? "Debe estar en proceso para reparar" : "Iniciar / editar reparación"}
          >
            🛠️ Reparación
          </button>

          <button
            className="bg-yellow-600 text-white px-3 py-1 text-sm font-medium rounded-full hover:bg-yellow-700 transition-colors shadow-md"
            onClick={() => setMostrarHistorial(true)}
          >
            📜 Historial
          </button>

          <button
            className="bg-red-600 text-white px-3 py-1 text-sm font-medium rounded-full hover:bg-red-700 transition-colors shadow-md"
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