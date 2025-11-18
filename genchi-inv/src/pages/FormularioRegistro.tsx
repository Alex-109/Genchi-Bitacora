// components/FormularioEquipo.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
    ram: 0,
    almacenamiento: 0,
    tipo_almacenamiento: "",
    toner: "",
    drum: "",
    conexion: "",
    nombre_equipo: "",
  });

  const [unidades, setUnidades] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [modalExito, setModalExito] = useState(false);
  const [enviando, setEnviando] = useState(false);

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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (value === "") {
      setForm((prev) => ({ ...prev, [name]: 0 }));
      return;
    }
    
    if (/^\d*$/.test(value)) {
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue)) {
        setForm((prev) => ({ ...prev, [name]: numericValue }));
      }
    }
  };

  const handleIPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const cleanedValue = value.replace(/[^0-9.]/g, '');
    const noConsecutiveDots = cleanedValue.replace(/\.{2,}/g, '.');
    const noStartingDot = noConsecutiveDots.replace(/^\./, '');
    const limitedValue = noStartingDot.slice(0, 15);
    
    setForm((prev) => ({ ...prev, [name]: limitedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (enviando) {
      return;
    }
    
    setEnviando(true);

    try {
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
        ram: 0,
        almacenamiento: 0,
        tipo_almacenamiento: "",
        toner: "",
        drum: "",
        conexion: "",
        nombre_equipo: "",
      });
      
    } catch (error: any) {
      setMensaje(error.response?.data?.mensaje || "❌ Error al crear el equipo.");
    } finally {
      setEnviando(false);
    }
  };

  const handleCerrarModal = () => {
    setModalExito(false);
    navigate("/busqueda-equipos");
  };

  const marcasActuales = marcasPorTipo[form.tipo_equipo] || [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 relative">
      <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Registrar Nuevo Equipo
          </h2>
          <p className="text-gray-600 mt-2">Complete todos los campos requeridos para el registro</p>
        </div>
        
        {mensaje && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {mensaje}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          {/* Tipo de Equipo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Equipo</label>
            <div className="relative">
              <select
                name="tipo_equipo"
                value={form.tipo_equipo}
                onChange={handleChange}
                className="w-full border-2 border-indigo-500 bg-indigo-50 text-indigo-800 font-semibold rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
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

          {/* Campos básicos */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Número de Inventario</label>
            <input 
              name="num_inv" 
              value={form.num_inv} 
              onChange={handleChange} 
              placeholder="Ej: INV-2024-001"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Número de Serie</label>
            <input 
              name="serie" 
              value={form.serie} 
              onChange={handleChange} 
              placeholder="Ej: SN123456789"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Unidad</label>
            <select 
              name="nombre_unidad" 
              value={form.nombre_unidad} 
              onChange={handleChange} 
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Selecciona Unidad</option>
              {unidades.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Marca</label>
            <select 
              name="marca" 
              value={form.marca} 
              onChange={handleChange} 
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              required
            >
              <option value="">Selecciona Marca</option>
              {marcasActuales.map((marca) => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>
          </div>

          {!(form.tipo_equipo === "pc" && (form.marca?.toLowerCase() || "") === "generico") && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Modelo</label>
              <input 
                name="modelo" 
                value={form.modelo} 
                onChange={handleChange} 
                placeholder="Ej: ThinkPad X1 Carbon"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
          )}

          {/* Campos específicos para PC y Notebook */}
          {(form.tipo_equipo === "pc" || form.tipo_equipo === "notebook") && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Dirección IP</label>
                <input 
                  name="ip" 
                  value={form.ip} 
                  onChange={handleIPChange} 
                  placeholder="Ej: 192.168.1.100"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nombre de Equipo</label>
                <input 
                  name="nombre_equipo" 
                  value={form.nombre_equipo} 
                  onChange={handleChange} 
                  placeholder="Ej: PC-OFICINA-01"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
                <input 
                  name="nombre_usuario" 
                  value={form.nombre_usuario} 
                  onChange={handleChange} 
                  placeholder="Ej: usuario.oficina"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sistema Operativo</label>
                <input 
                  name="windows" 
                  value={form.windows} 
                  onChange={handleChange} 
                  placeholder="Ej: Windows 11 Pro"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Versión de Windows</label>
                <input 
                  name="ver_win" 
                  value={form.ver_win} 
                  onChange={handleChange} 
                  placeholder="Ej: 23H2"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
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
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label className="text-gray-700 font-medium select-none">
                  Antivirus instalado
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">RAM (GB)</label>
                <input 
                  name="ram" 
                  value={form.ram === 0 ? "" : form.ram}
                  onChange={handleNumberChange}
                  placeholder="Ej: 16"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  type="number"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Procesador (CPU)</label>
                <input 
                  name="cpu" 
                  value={form.cpu} 
                  onChange={handleChange} 
                  placeholder="Ej: Intel Core i7-12700H"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Almacenamiento (GB)</label>
                <input
                  name="almacenamiento"
                  value={form.almacenamiento === 0 ? "" : form.almacenamiento}
                  onChange={handleNumberChange}
                  placeholder="Ej: 512"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  type="number"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tipo de Almacenamiento</label>
                <select 
                  name="tipo_almacenamiento" 
                  value={form.tipo_almacenamiento} 
                  onChange={handleChange} 
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="">Selecciona Tipo</option>
                  {tiposAlmacenamiento.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Campos específicos para Impresora */}
          {form.tipo_equipo === "impresora" && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tipo de Conexión</label>
                <select
                  name="conexion"
                  value={form.conexion}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="">Selecciona Conexión</option>
                  <option value="WiFi">WiFi</option>
                  <option value="Ethernet">Ethernet</option>
                  <option value="USB">USB</option>
                </select>
              </div>

              {((form.conexion?.toLowerCase() || "") !== "usb") && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Dirección IP</label>
                  <input
                    name="ip"
                    value={form.ip}
                    onChange={handleIPChange}
                    placeholder="Ej: 192.168.1.50"
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              )}
                
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Toner</label>
                <input 
                  name="toner" 
                  value={form.toner} 
                  onChange={handleChange} 
                  placeholder="Ej: TN-660"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Drum</label>
                <input 
                  name="drum" 
                  value={form.drum} 
                  onChange={handleChange} 
                  placeholder="Ej: DR-660"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </>
          )}

          {/* Comentarios */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios Adicionales</label>
            <textarea
              name="comentarios"
              value={form.comentarios}
              onChange={handleChange}
              rows={4}
              placeholder="Ingrese cualquier comentario adicional sobre el equipo..."
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Botón de enviar */}
          <div className="md:col-span-2 flex justify-center pt-4">
            <button
              type="submit"
              disabled={enviando}
              className={`
                relative px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform
                ${enviando 
                  ? 'bg-gray-400 cursor-not-allowed scale-95' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl active:scale-95'
                }
              `}
            >
              {enviando ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Registrar Equipo
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de éxito */}
      {modalExito && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 max-w-md mx-4 border border-gray-200 transform animate-scale-in">
            <div className="text-center">
              {/* Ícono de éxito */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Éxito!</h3>
              <p className="text-gray-600 mb-6">
                El equipo se ha registrado correctamente en el sistema.
              </p>
              
              <button
                onClick={handleCerrarModal}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Ver Lista de Equipos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}