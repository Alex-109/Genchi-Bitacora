// components/FormularioEquipo.tsx
import { useState, useEffect } from "react";
import type { Equipo, TipoEquipo } from "../types/equipo";
import { crearEquipo } from "../services/equiposApi";
import { obtenerUnidades } from "../services/unidadesApi";

const tiposEquipos: TipoEquipo[] = ["pc", "notebook", "impresora"];

const marcasPorTipo: Record<TipoEquipo, string[]> = {
  pc: ["HP", "Dell", "Lenovo", "Asus", "Acer", "Generico"],
  notebook: ["Apple", "Samsung", "HP", "Lenovo", "Dell"],
  impresora: ["Brother", "Epson", "Canon", "HP"],
  todos: [],
};

const tiposAlmacenamiento = ["SSD", "HDD", "NVMe"];

export default function FormularioEquipo() {
  const [form, setForm] = useState<Omit<Equipo, "id">>({
    tipo_equipo: "pc",
    num_inv: "",
    serie: "",
    nombre_unidad: "",
    marca: "",
    modelo: "",
    ip: "",
    comentarios: "",
    estado: "en proceso de reparacion", 
    windows: "Windows 10",
    ver_win: "22H2",
    antivirus: "Sí",
    nombre_usuario: "",
    cpu: "",
    ram: 0, // ✅ number
    almacenamiento: 0, // ✅ number
    tipo_almacenamiento: "",
    toner: "",
    drum: "",
    conexion: "",
    nombre_equipo: "",
  });

  const [unidades, setUnidades] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [modalExito, setModalExito] = useState(false);

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const nombresUnidades = await obtenerUnidades();
        setUnidades(nombresUnidades); 
      } catch (error) {
        console.error("Error obteniendo unidades:", error);
        setUnidades([]);
      }
    };
    fetchUnidades();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ NUEVA FUNCIÓN: Manejar cambios en campos numéricos
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Si el campo está vacío, establecer como 0
    if (value === "") {
      setForm((prev) => ({ ...prev, [name]: 0 }));
      return;
    }
    
    // Solo permitir números
    if (/^\d*$/.test(value)) {
      const numericValue = parseInt(value, 10);
      // Si es un número válido, guardar como número
      if (!isNaN(numericValue)) {
        setForm((prev) => ({ ...prev, [name]: numericValue }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ✅ Asegurar que los campos numéricos sean números válidos

      
      // ✅ SOLUCIÓN: Eliminar nombre_equipo solo para impresoras
      let datosParaEnviar = { ...form };

      if (form.tipo_equipo === 'impresora') {
        delete datosParaEnviar.nombre_equipo;
      }

      const equipoParaEnviar = {
        ...datosParaEnviar,
        ram: form.ram || 0,
        almacenamiento: form.almacenamiento || 0,
        historial_ingresos: [{ 
          fecha: new Date().toISOString(), 
          estado: "en proceso de reparacion" as "en proceso de reparacion" 
        }],
      };
      await crearEquipo(equipoParaEnviar);
      setModalExito(true);
      
      // ✅ Resetear formulario manteniendo tipos correctos
      setForm({
        tipo_equipo: "pc",
        num_inv: "",
        serie: "",
        nombre_unidad: "",
        marca: "",
        modelo: "",
        ip: "",
        comentarios: "",
        estado: "en proceso de reparacion",
        windows: "Windows 10",
        ver_win: "22H2",
        antivirus: "Sí",
        nombre_usuario: "",
        cpu: "",
        ram: 0, // ✅ Resetear como número
        almacenamiento: 0, // ✅ Resetear como número
        tipo_almacenamiento: "",
        toner: "",
        drum: "",
        conexion: "",
        nombre_equipo: "",
      });
      
    } catch (error: any) {
      setMensaje(error.response?.data?.mensaje || "❌ Error al crear el equipo.");
    }
  };

  const marcasActuales = marcasPorTipo[form.tipo_equipo] || [];

  // ✅ AGREGAR esta función en tu componente
const handleIPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  
  // Solo permitir números y puntos
  const cleanedValue = value.replace(/[^0-9.]/g, '');
  
  // Validar que no haya puntos consecutivos
  const noConsecutiveDots = cleanedValue.replace(/\.{2,}/g, '.');
  
  // Validar que no empiece con punto
  const noStartingDot = noConsecutiveDots.replace(/^\./, '');
  
  // Limitar a 15 caracteres (xxx.xxx.xxx.xxx)
  const limitedValue = noStartingDot.slice(0, 15);
  
  setForm((prev) => ({ ...prev, [name]: limitedValue }));
};

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 relative">
      <div className="bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Registrar Equipo</h2>
        {mensaje && <p className="mb-4 text-sm text-red-600">{mensaje}</p>}

        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Equipo</label>
            <div className="relative">
              <select
                name="tipo_equipo"
                value={form.tipo_equipo}
                onChange={handleChange}
                className="w-full border-2 border-indigo-500 bg-indigo-50 text-indigo-800 font-semibold rounded-xl px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                {tiposEquipos.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo.toUpperCase()}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <input name="num_inv" value={form.num_inv} onChange={handleChange} placeholder="Número de Inventario" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
          <input name="serie" value={form.serie} onChange={handleChange} placeholder="Serie" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />

          <select 
            name="nombre_unidad" 
            value={form.nombre_unidad} 
            onChange={handleChange} 
            className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option key="default-unidad" value="">Selecciona Unidad</option>
            {unidades.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
            <option key="otros-unidad" value="Otros">Otros</option> 
          </select>

          <select name="marca" value={form.marca} onChange={handleChange} className="input border-2 border-gray-400 rounded-lg px-3 py-2" required>
            <option value="">Selecciona Marca</option>
            {marcasActuales.map((marca) => (
              <option key={marca} value={marca}>{marca}</option>
            ))}
          </select>

          {!(form.tipo_equipo === "pc" && (form.marca?.toLowerCase() || "") === "generico") && (
            <input name="modelo" value={form.modelo} onChange={handleChange} placeholder="Modelo" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
          )}

          {(form.tipo_equipo === "pc" || form.tipo_equipo === "notebook") && (
            <>
              {/* ✅ CAMPO IP AGREGADO AQUÍ */}
                <input 
                name="ip" 
                value={form.ip} 
                onChange={handleIPChange} 
                placeholder="Dirección IP (ej: 192.168.1.100)" 
                className="input border-2 border-gray-400 rounded-lg px-3 py-2" 
              />
              
              <input name="nombre_equipo" value={form.nombre_equipo} onChange={handleChange} placeholder="Nombre de Equipo" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
              <input name="nombre_usuario" value={form.nombre_usuario} onChange={handleChange} placeholder="Nombre de Usuario" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
              <input name="windows" value={form.windows} onChange={handleChange} placeholder="Windows" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
              <input name="ver_win" value={form.ver_win} onChange={handleChange} placeholder="Versión Windows" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="antivirus"
                  checked={form.antivirus === "Sí"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      antivirus: e.target.checked ? "Sí" : "No",
                    }))
                  }
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
                />
                <label className="text-gray-700 font-medium select-none">
                  Antivirus instalado
                </label>
              </div>

              <input 
                name="ram" 
                value={form.ram === 0 ? "" : form.ram}
                onChange={handleNumberChange}
                placeholder="RAM (ej: 8)" 
                className="input border-2 border-gray-400 rounded-lg px-3 py-2" 
                type="number"
                min="0"
              />

              <input name="cpu" value={form.cpu} onChange={handleChange} placeholder="CPU" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
              
              <input
                name="almacenamiento"
                value={form.almacenamiento === 0 ? "" : form.almacenamiento}
                onChange={handleNumberChange}
                placeholder="Almacenamiento (ej: 256)"
                className="input border-2 border-gray-400 rounded-lg px-3 py-2"
                type="number"
                min="0"
              />

              <select name="tipo_almacenamiento" value={form.tipo_almacenamiento} onChange={handleChange} className="input border-2 border-gray-400 rounded-lg px-3 py-2">
                <option value="">Selecciona Tipo de Almacenamiento</option>
                {tiposAlmacenamiento.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </>
          )}

          {form.tipo_equipo === "impresora" && (
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <select
                name="conexion"
                value={form.conexion}
                onChange={handleChange}
                className="input border-2 border-gray-400 rounded-lg px-3 py-2"
              >
                <option value="">Tipo de Conexión</option>
                <option value="WiFi">WiFi</option>
                <option value="Ethernet">Ethernet</option>
                <option value="USB">USB</option>
              </select>

              {((form.conexion?.toLowerCase() || "") !== "usb") && (
                <input
                  name="ip"
                  value={form.ip}
                  onChange={handleChange}
                  placeholder="IP"
                  className="input border-2 border-gray-400 rounded-lg px-3 py-2"
                />
              )}
                
              <input name="toner" value={form.toner} onChange={handleChange} placeholder="Toner" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
              <input name="drum" value={form.drum} onChange={handleChange} placeholder="Drum" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
            <textarea
              name="comentarios"
              value={form.comentarios}
              onChange={handleChange}
              rows={4}
              placeholder="Comentarios adicionales..."
              className="w-full border-2 border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            >
              Registrar Equipo
            </button>
          </div>
        </form>
      </div>

      {modalExito && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
            <h3 className="text-xl font-bold text-green-600 mb-2">¡Equipo registrado!</h3>
            <p className="mb-4 text-gray-700">El equipo se ha registrado correctamente.</p>
            <button
              onClick={() => setModalExito(false)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}