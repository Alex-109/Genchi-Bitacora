import { useState } from "react";
import type { Equipo } from "../types/equipo";
import ModalHistorial from "./ModalHistorial";
import ModalReparacion from "./ModalReparacion";
import BotonIngreso from "./BotonIngreso"; // ✅ importamos el nuevo botón

interface Props {
  equipo: Equipo;
  onEliminar: (equipo: Equipo) => void;
  onActualizarLista: () => void;
}

// Funciones auxiliares para atributos (igual que antes)
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

  const gridColsClass = "grid-cols-2";

  return (
    <>
      <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col h-full">
        
        {/* Encabezado */}
        <h2 className="font-bold text-xl mb-3 text-blue-700 border-b pb-2">
          {equipo.nombre_equipo || equipo.tipo_equipo.toUpperCase()}
        </h2>

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

        {/* Botones */}
        <div className="mt-4 pt-3 border-t flex gap-3 justify-end">
          {/* Botón de ingreso */}
          <BotonIngreso
            equipo={equipo}
            onIngresoRegistrado={onActualizarLista} // refresca lista después de marcar
          />
          {/* Botones existentes */}
          <button
            className="bg-green-600 text-white px-3 py-1 text-sm font-medium rounded-full hover:bg-green-700 transition-colors shadow-md"
            onClick={() => setMostrarReparacion(true)}
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
