// src/components/ModalHistorial.tsx

import { useEffect, useState } from "react";
import { obtenerReparacionesPorEquipo } from "../services/reparacionesApi";
// Asumimos que estas interfaces están en un archivo de types o las definimos aquí:
import type { HistorialCombinado, HistorialIngreso, Reparacion } from "../types/equipo"

// 🆕 Tipo para el Historial Final (combinando ingreso/reparación/egreso)
interface HistorialCiclo {
    id_repa: string;
    obs: string;
    cambios: Record<string, { antes: any; despues: any }>;
    fecha_reparacion: string; // Fecha de Salida/Entrega
    fecha_ingreso: string;    // Fecha de Entrada/Ingreso
}

interface Props {
  idEquipo: number;
  onClose: () => void;
}

// 💡 FUNCIÓN DE PROCESAMIENTO CLAVE CORREGIDA
const enlazarHistorial = (
    reparaciones: Reparacion[], 
    ingresos: HistorialIngreso[]
): HistorialCiclo[] => {
    
    // 1. Obtener solo los eventos de ingreso, usando el string de estado CORRECTO.
    const ingresosEnProceso = ingresos.filter(i => i.estado === "en proceso de reparacion");

    // 2. CORRECCIÓN DE ORDEN: 
    // Invertir el array de ingresos para que esté ordenado DESC (el más nuevo primero),
    // coincidiendo con el array de 'reparaciones' que viene así del backend.
    const ingresosEnProcesoDesc = ingresosEnProceso.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    // 3. Mapear las reparaciones (que ya están DESC) y emparejar por índice.
    const historialCombinado: HistorialCiclo[] = reparaciones.map((reparacion, index) => {
        const ingreso = ingresosEnProcesoDesc[index]; 
        
        return {
            id_repa: reparacion._id,
            obs: reparacion.obs,
            cambios: reparacion.cambios,
            fecha_reparacion: reparacion.createdAt, // Fecha de Salida (DESC)
            fecha_ingreso: ingreso ? ingreso.fecha : "Desconocida", // Fecha de Entrada (DESC)
        };
    });

    return historialCombinado;
}

const formatDate = (dateString: string): string => {
    if (!dateString || dateString === "Desconocida") return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ModalHistorial({ idEquipo, onClose }: Props) {
  // ✅ Cambiamos el estado para almacenar el tipo combinado
  const [historial, setHistorial] = useState<HistorialCiclo[]>([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const cargarHistorial = async () => {
        setLoading(true);
        setError(null);
        try {
            // Forzar idEquipo a número y log para depuración
            const id = Number(idEquipo);
            console.log("Consultando historial para idEquipo:", id, typeof id);
            const res = await obtenerReparacionesPorEquipo(id);
            const data = res?.data as HistorialCombinado;
            console.log('Respuesta de API:', data);

            const { historial_reparaciones, historial_ingresos } = data;

            if (!Array.isArray(historial_reparaciones) || historial_reparaciones.length === 0) {
                setHistorial([]);
            } else {
                const historialMapeado = enlazarHistorial(
                    historial_reparaciones as Reparacion[],
                    (historial_ingresos || []) as HistorialIngreso[]
                );
                setHistorial(historialMapeado);
            }
        } catch (err: any) {
            console.error("Error cargando historial:", err);
            setError(err?.response?.data?.message || "Error al cargar historial");
            setHistorial([]);
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    if (!idEquipo) return;
    cargarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEquipo]);

  // Cálculo de días en servicio
  const calcularDias = (ingreso: string, salida: string): string => {
    if (ingreso === "Desconocida" || salida === "Desconocida") return "—";
    const diffTime = new Date(salida).getTime() - new Date(ingreso).getTime();
    if (diffTime < 0) return "Error en fechas";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Menos de 1 día";
    return `${diffDays} día(s)`;
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto relative px-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
          🛠️ Historial de Servicios
        </h2>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Cerrar"
        >
          &times;
        </button>

        {loading ? (
          <div className="py-10 flex items-center justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-10 text-lg">{error}</div>
        ) : historial.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-lg">
            No hay ciclos de servicio registrados para este equipo.
          </p>
        ) : (
          <ul className="space-y-6">
            {historial.map((r) => (
              <li
                key={r.id_repa}
                className="border-l-4 border-indigo-500 rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex flex-col gap-2 text-sm text-gray-700">
                  
                  {/* Fila de Fechas de Servicio */}
                  <div className="grid grid-cols-2 gap-4 border-b pb-2 mb-2">
                    <div>
                        <span className="font-bold text-green-600">ENTRADA (Ingreso):</span>
                        <div className="text-gray-800">{formatDate(r.fecha_ingreso)}</div>
                    </div>
                    <div>
                        <span className="font-bold text-red-600">SALIDA (Entrega):</span>
                        <div className="text-gray-800">{formatDate(r.fecha_reparacion)}</div>
                    </div>
                    <div className="col-span-2 mt-2 text-sm">
                        <span className="font-medium text-indigo-600">Días en reparacion:</span>
                        <span className="ml-2 font-bold text-gray-700">{calcularDias(r.fecha_ingreso, r.fecha_reparacion)}</span>
                    </div>
                  </div>

                  {/* ID y Observaciones */}
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-indigo-600">ID Reparación:</span>
                    <span className="text-gray-800 font-mono">{r.id_repa}</span>
                  </div>
                  <div>
                    <span className="font-medium text-indigo-600">Observaciones Técnicas:</span>
                    <p className="mt-1 text-gray-600">{r.obs || "—"}</p>
                  </div>
                </div>

                {/* Cambios Realizados */}
                                {Object.keys(r.cambios ?? {}).length > 0 && (
                                    <div className="mt-4">
                                        <span className="font-medium text-indigo-600">Cambios realizados:</span>
                                        <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                                            {Object.entries(r.cambios ?? {}).map(([campo, val]) => (
                                                <li key={campo}>
                                                    <span className="font-semibold">{campo}</span>:{" "}
                                                    <span className="text-gray-600">{String(val.antes)}</span> →{" "}
                                                    <span className="text-gray-600">{String(val.despues)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
