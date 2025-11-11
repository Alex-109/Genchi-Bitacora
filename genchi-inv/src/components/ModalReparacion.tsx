// src/components/ModalReparacion.tsx
import { useEffect, useState } from "react";
import type { Equipo } from "../types/equipo";
import { iniciarReparacion } from "../services/reparacionesApi";
// ✅ IMPORTACIÓN AÑADIDA: Para cambiar el estado después de la reparación
import { actualizarEstadoEquipo } from "../services/equiposApi";

interface Props {
  equipo: Equipo;
  onClose: () => void;
  onReparacionExitosa: () => void;
}

// **Componente Auxiliar para un campo de formulario**
interface CampoProps {
  label: string;
  name: keyof Equipo | "windows" | "ver_win" | "ram_gb";
  value: string | number | undefined;
  type?: "text" | "select" | "textarea";
  options?: { value: string; label: string }[];
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const Campo: React.FC<CampoProps> = ({
  label,
  name,
  value,
  type = "text",
  options,
  onChange,
}) => (
  <label className="block text-sm">
    <div className="text-xs text-gray-600 mb-1">{label}</div>
    {type === "select" ? (
      <select
        name={name as string}
        value={value || ""}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        name={name as string}
        value={value || ""}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    ) : (
      <input
        name={name as string}
        value={value || ""}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    )}
  </label>
);

export default function ModalReparacion({
  equipo,
  onClose,
  onReparacionExitosa,
}: Props) {
  const [formData, setFormData] = useState<Partial<Equipo>>({});
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(equipo ?? {});
  }, [equipo]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
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
      const origNorm =
        original === undefined || original === null
          ? ""
          : String(original).trim();
      const newNorm =
        nuevo === undefined || nuevo === null ? "" : String(nuevo).trim();
      if (origNorm !== newNorm) {
        cambios[String(key)] = nuevo;
      }
    }
    return cambios;
  };
// src/components/ModalReparacion.tsx (Fragmento del handleSubmit)

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const cambios = calcularCambiosReales();
      const obsLimpia = obs.trim();

      if (Object.keys(cambios).length === 0 && obsLimpia === "") {
        setError("No hay cambios de atributos ni observaciones para registrar.");
        setLoading(false);
        return;
      }

      // ✅ CORRECCIÓN CLAVE: Validación y tipado.
      // Aseguramos que idEquipo sea un número. Si es null/undefined, detenemos el proceso.
      const idEquipo = equipo.id;
      if (typeof idEquipo !== 'number' || idEquipo <= 0) {
        setError("Error fatal: ID de equipo no válido o faltante.");
        setLoading(false);
        return;
      }
      
      const estadoFinal = "entregado";

      // 1. LLAMADA ORIGINAL: Iniciar/Registrar la reparación
      await iniciarReparacion({
        id_equipo: idEquipo, // Usamos el ID validado (es un number)
        cambios,
        obs: obsLimpia,
        rut: "12345678-9",
      });
      
      // 2. NUEVA FUNCIONALIDAD: Cambiar el estado del equipo
      await actualizarEstadoEquipo(idEquipo, estadoFinal);

      onReparacionExitosa();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Error al generar/finalizar reparación"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ===== ORDEN DE CAMPOS =====
  const camposComunes: CampoProps[] = [
    { label: "Marca", name: "marca", value: formData.marca, onChange: handleChange },
    { label: "Modelo", name: "modelo", value: formData.modelo, onChange: handleChange },
    { label: "Serie", name: "serie", value: formData.serie, onChange: handleChange },
    { label: "Número de Inventario", name: "num_inv", value: formData.num_inv, onChange: handleChange },
    { label: "Unidad", name: "nombre_unidad", value: formData.nombre_unidad, onChange: handleChange },
    { label: "IP", name: "ip", value: formData.ip, onChange: handleChange },
  ];

  let camposEspecificos: CampoProps[] = [];
  if (equipo.tipo_equipo === "pc" || equipo.tipo_equipo === "notebook") {
    camposEspecificos = [
      { label: "Nombre del Equipo", name: "nombre_equipo", value: formData.nombre_equipo, onChange: handleChange },
      { label: "Usuario", name: "nombre_usuario", value: formData.nombre_usuario, onChange: handleChange },
      { label: "Windows", name: "windows", value: formData.windows, onChange: handleChange },
      { label: "Versión de Windows", name: "ver_win", value: formData.ver_win, onChange: handleChange },
      {
        label: "Antivirus",
        name: "antivirus",
        value: formData.antivirus,
        type: "select",
        options: [
          { value: "si", label: "Sí" },
          { value: "no", label: "No" },
        ],
        onChange: handleChange,
      },
      { label: "CPU", name: "cpu", value: formData.cpu, onChange: handleChange },
      { label: "RAM (GB)", name: "ram", value: formData.ram, onChange: handleChange },
      { label: "Almacenamiento", name: "almacenamiento", value: formData.almacenamiento, onChange: handleChange },
      { label: "Tipo de Almacenamiento", name: "tipo_almacenamiento", value: formData.tipo_almacenamiento, onChange: handleChange },
    ];
  } else if (equipo.tipo_equipo === "impresora") {
    camposEspecificos = [
      { label: "Tóner", name: "toner", value: formData.toner, onChange: handleChange },
      { label: "Drum", name: "drum", value: formData.drum, onChange: handleChange },
      { label: "Conexión", name: "conexion", value: formData.conexion, onChange: handleChange },
    ];
  }

  const campoComentarios: CampoProps = {
    label: "Comentarios",
    name: "comentarios",
    value: formData.comentarios,
    type: "textarea",
    onChange: handleChange,
  };

  
  
  

  // ===== RENDER =====
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-3xl bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-lg p-2">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M12 9v6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Generar Reparación</h3>
              <p className="text-sm opacity-90">
                Equipo: <span className="font-medium">{equipo.nombre_equipo || equipo.tipo_equipo}</span> — Serie:{" "}
                <span className="font-medium">{equipo.serie || "—"}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/20 hover:bg-white/30 transition text-sm"
          >
            Cerrar
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-2 text-sm">{error}</div>
          )}

          {/* Sección: Datos del equipo */}
          <h4 className="text-gray-700 font-semibold mb-2 mt-2">Datos del equipo</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-6">
            {camposComunes.map((campo) => (
              <Campo key={campo.name} {...campo} onChange={handleChange} />
            ))}
          </div>

          {/* Sección: Detalles técnicos */}
          {camposEspecificos.length > 0 && (
            <>
              <h4 className="text-gray-700 font-semibold mb-2 mt-4">Detalles técnicos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-6">
                {camposEspecificos.map((campo) => (
                  <Campo key={campo.name} {...campo} onChange={handleChange} />
                ))}
              </div>
            </>
          )}

          {/* Sección: Comentarios */}
          <h4 className="text-gray-700 font-semibold mb-2 mt-4">Comentarios</h4>
          <Campo {...campoComentarios} onChange={handleChange} />

          {/* Sección: Observaciones */}
          <div className="mt-6">
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Observaciones de la Reparación
            </label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-300"
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 sticky bottom-0 z-10">
          <div className="flex items-center justify-between gap-4">
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
