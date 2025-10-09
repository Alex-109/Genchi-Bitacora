// src/components/ModalReparacion.tsx
import { useEffect, useState } from "react";
import type { Equipo } from "../types/equipo";
import { iniciarReparacion } from "../services/reparacionesApi";

interface Props {
  equipo: Equipo;
  onClose: () => void;
  onReparacionExitosa: () => void;
}

export default function ModalReparacion({ equipo, onClose, onReparacionExitosa }: Props) {
  const [formData, setFormData] = useState<Partial<Equipo>>({});
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(equipo ?? {});
  }, [equipo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calcularCambiosReales = (): Record<string, any> => {
    const cambios: Record<string, any> = {};
    if (!equipo) return cambios;
    const keys = Object.keys(formData) as Array<keyof Equipo>;
    for (const key of keys) {
      // @ts-ignore
      const original = (equipo as any)[key];
      // @ts-ignore
      const nuevo = (formData as any)[key];
      const origNorm = original === undefined || original === null ? "" : String(original).trim();
      const newNorm = nuevo === undefined || nuevo === null ? "" : String(nuevo).trim();
      if (origNorm !== newNorm) {
        cambios[String(key)] = nuevo;
      }
    }
    return cambios;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const cambios = calcularCambiosReales();
      if (Object.keys(cambios).length === 0) {
        setError("No hay cambios para registrar.");
        setLoading(false);
        return;
      }

      await iniciarReparacion({
        id_equipo: equipo.id!,
        cambios,
        obs,
        rut: "12345678-9",
      });

      onReparacionExitosa();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al generar reparación");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Contenedor principal del Modal. Clases añadidas: max-h-[90vh] y overflow-y-auto */}
      <div className="relative w-full max-w-3xl bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"> 
        {/* Header - No se toca para mantenerlo visible */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white sticky top-0 z-10"> {/* Añadida clase sticky top-0 z-10 para mantener el header visible al scrollear */}
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-lg p-2">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M12 9v6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Generar Reparación</h3>
              <p className="text-sm opacity-90">Equipo: <span className="font-medium">{equipo.nombre_equipo || equipo.tipo_equipo}</span> — Serie: <span className="font-medium">{equipo.serie || "—"}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/20 hover:bg-white/30 transition text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Content - El contenido que se desplazará */}
        <div className="px-6 py-6"> {/* Esta sección ahora forma parte del contenido desplazable */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm">
                <div className="text-xs text-gray-600 mb-1">Marca</div>
                <input
                  name="marca"
                  value={formData.marca || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </label>

              <label className="block text-sm">
                <div className="text-xs text-gray-600 mb-1">Modelo</div>
                <input
                  name="modelo"
                  value={formData.modelo || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </label>

              <label className="block text-sm">
                <div className="text-xs text-gray-600 mb-1">Serie</div>
                <input
                  name="serie"
                  value={formData.serie || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </label>

              <label className="block text-sm">
                <div className="text-xs text-gray-600 mb-1">Num Inv</div>
                <input
                  name="num_inv"
                  value={formData.num_inv || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </label>

              <label className="block text-sm">
                <div className="text-xs text-gray-600 mb-1">IP</div>
                <input
                  name="ip"
                  value={formData.ip || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </label>
            </div>

            <div className="space-y-3">
              {equipo.tipo_equipo === "pc" && (
                <>
                  <label className="block text-sm">
                    <div className="text-xs text-gray-600 mb-1">Usuario</div>
                    <input
                      name="nombre_usuario"
                      value={formData.nombre_usuario || ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </label>
                  <label className="block text-sm">
                        <div className="text-xs text-gray-600 mb-1">Nombre Equipo</div>
                        <input
                        name="nombre_equipo"
                        value={formData.nombre_equipo || ""}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-sm">
                      <div className="text-xs text-gray-600 mb-1">Windows</div>
                      <input
                        name="windows"
                        value={formData.windows || ""}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </label>

                    <label className="block text-sm">
                      <div className="text-xs text-gray-600 mb-1">Versión</div>
                      <input
                        name="ver_win"
                        value={formData.ver_win || ""}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </label>
                  </div>

                  <label className="block text-sm">
                    <div className="text-xs text-gray-600 mb-1">Antivirus</div>
                    <select
                      name="antivirus"
                      value={formData.antivirus || "si"}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </label>

                  <label className="block text-sm">
                    <div className="text-xs text-gray-600 mb-1">CPU</div>
                    <input
                      name="cpu"
                      value={formData.cpu || ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </label>

                  <label className="block text-sm">
                    <div className="text-xs text-gray-600 mb-1">RAM</div>
                    <input
                      name="ram"
                      value={formData.ram || ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </label>

                  <label className="block text-sm">
                    <div className="text-xs text-gray-600 mb-1">Almacenamiento</div>
                    <input
                      name="almacenamiento"
                      value={formData.almacenamiento || ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </label>

                  <label className="block text-sm">
                    <div className="text-xs text-gray-600 mb-1">Tipo almacenamiento</div>
                    <input
                      name="tipo_almacenamiento"
                      value={formData.tipo_almacenamiento || ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </label>
                </>
              )}

              {equipo.tipo_equipo === "impresora" && (
                <>
                  <label className="block text-sm">
                    <div className="text-xs text-gray-600 mb-1">Toner</div>
                    <input
                      name="toner"
                      value={formData.toner || ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </label>

                  <label className="block text-sm">
                    <div className="text-xs text-gray-600 mb-1">Drum</div>
                    <input
                      name="drum"
                      value={formData.drum || ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </label>

                  <label className="block text-sm">
                    <div className="text-xs text-gray-600 mb-1">Conexión</div>
                    <input
                      name="conexion"
                      value={formData.conexion || ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-700 mb-2">Observaciones</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-300"
              rows={4}
            />
          </div>
        </div>
        
        {/* Footer - Lo muevo fuera de la sección de contenido desplazable y lo hago sticky */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 sticky bottom-0 z-10">
          <div className="mt- flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              <div><strong>Equipo ID:</strong> {equipo.id}</div>
              <div className="mt-1"><strong>Tipo:</strong> {equipo.tipo_equipo}</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.02] transition transform disabled:opacity-60"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : null}
                <span>{loading ? "Guardando..." : "Generar Reparación"}</span>
              </button>

              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}