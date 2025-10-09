// src/components/ModalHistorial.tsx
import { useEffect, useState } from "react";
import { obtenerReparacionesPorEquipo } from "../services/reparacionesApi";

interface ReparacionLocal {
  id_repa: string;
  obs: string;
  cambios: Record<string, { antes: any; despues: any }>;
  fecha: string;
}

interface Props {
  idEquipo: number;
  onClose: () => void;
}

export default function ModalHistorial({ idEquipo, onClose }: Props) {
  const [reparaciones, setReparaciones] = useState<ReparacionLocal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await obtenerReparacionesPorEquipo(idEquipo);
      const data = res?.data;

      if (!Array.isArray(data)) {
        setReparaciones([]);
      } else {
        const mapped: ReparacionLocal[] = data.map((item: any) => ({
          id_repa: String(item._id ?? item.id_repa ?? ""),
          obs: item.obs ?? item.observaciones ?? "",
          cambios: item.cambios ?? {},
          fecha: item.createdAt ?? item.fecha ?? ""
        }));
        setReparaciones(mapped);
      }
    } catch (err: any) {
      console.error("Error cargando historial:", err);
      setError(err?.response?.data?.message || "Error al cargar historial");
      setReparaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!idEquipo) return;
    cargarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEquipo]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto relative px-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
          🛠️ Historial de Reparaciones
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
        ) : reparaciones.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-lg">
            No hay reparaciones registradas para este equipo.
          </p>
        ) : (
          <ul className="space-y-6">
            {reparaciones.map((r) => (
              <li
                key={r.id_repa}
                className="border rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex flex-col gap-2 text-sm text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-indigo-600">ID Reparación:</span>
                    <span className="text-gray-800 font-mono">{r.id_repa}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-indigo-600">Fecha:</span>
                    <span>{r.fecha ? new Date(r.fecha).toLocaleString() : "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-indigo-600">Observaciones:</span>
                    <p className="mt-1 text-gray-600">{r.obs || "—"}</p>
                  </div>
                </div>

                {Object.keys(r.cambios).length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-indigo-600">Cambios realizados:</span>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                      {Object.entries(r.cambios).map(([campo, val]) => (
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
