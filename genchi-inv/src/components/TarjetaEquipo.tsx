import { useState } from "react";
import type { Equipo } from "../types/equipo";
import ModalHistorial from "./ModalHistorial";
import ModalReparacion from "./ModalReparacion";

interface Props {
  equipo: Equipo;
  onEliminar: (id: number) => void;
  onActualizarLista: () => void; // callback para refrescar listado
}

export default function TarjetaEquipo({ equipo, onEliminar, onActualizarLista }: Props) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarReparacion, setMostrarReparacion] = useState(false);

  return (
    <>
      <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
        <h2 className="font-bold text-lg">{equipo.nombre_equipo || equipo.tipo_equipo}</h2>
        <p><span className="font-semibold">Marca:</span> {equipo.marca}</p>
        <p><span className="font-semibold">Modelo:</span> {equipo.modelo}</p>
        <p><span className="font-semibold">Serie:</span> {equipo.serie}</p>
        <p><span className="font-semibold">Num Inv:</span> {equipo.num_inv}</p>
        <p><span className="font-semibold">Unidad:</span> {equipo.nombre_unidad}</p>
        <p><span className="font-semibold">IP:</span> {equipo.ip}</p>

        {(equipo.tipo_equipo === "pc" || equipo.tipo_equipo === "notebook") && (
          <>
            <p><span className="font-semibold">Usuario:</span> {equipo.nombre_usuario}</p>
            <p><span className="font-semibold">Windows:</span> {equipo.windows} {equipo.ver_win}</p>
            <p><span className="font-semibold">Antivirus:</span> {equipo.antivirus}</p>
            <p><span className="font-semibold">CPU:</span> {equipo.cpu}</p>
            <p><span className="font-semibold">RAM:</span> {equipo.ram}</p>
            <p><span className="font-semibold">Almacenamiento:</span> {equipo.almacenamiento} ({equipo.tipo_almacenamiento})</p>
          </>
        )}

        {equipo.tipo_equipo === "impresora" && (
          <>
            <p><span className="font-semibold">Toner:</span> {equipo.toner}</p>
            <p><span className="font-semibold">Drum:</span> {equipo.drum}</p>
            <p><span className="font-semibold">Conexión:</span> {equipo.conexion}</p>
          </>
        )}

        <div className="mt-4 flex gap-2">
          <button
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
            onClick={() => setMostrarReparacion(true)}
          >
            Reparación
          </button>
          <button
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
            onClick={() => setMostrarHistorial(true)}
          >
            Historial
          </button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
            onClick={() => onEliminar(equipo.id!)}
          >
            Eliminar
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
