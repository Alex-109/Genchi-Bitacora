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
    ram: "",
    almacenamiento: "",
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
        const res = await obtenerUnidades();
        setUnidades(res);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearEquipo(form);
      setModalExito(true); // Mostrar modal
      setForm((prev) => ({
        ...prev,
        num_inv: "",
        serie: "",
        nombre_unidad: "",
        marca: "",
        modelo: "",
        ip: "",
        comentarios: "",
        estado: "",
        usuario: "",
        cpu: "",
        ram: "",
        almacenamiento: "",
        tipo_almacenamiento: "",
        toner: "",
        drum: "",
        conexion: "",
        nombre_equipo: "",
      }));
    } catch (error: any) {
      setMensaje(error.response?.data?.mensaje || "❌ Error al crear el equipo.");
    }
  };

  const marcasActuales = marcasPorTipo[form.tipo_equipo] || [];

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

  <select name="nombre_unidad" value={form.nombre_unidad} onChange={handleChange} className="input border-2 border-gray-400 rounded-lg px-3 py-2">
    <option value="">Selecciona Unidad</option>
    {unidades.map((u) => <option key={u} value={u}>{u}</option>)}
    <option value="Otros">Otros</option>
  </select>

  {/* Marca dinámica */}
  <select name="marca" value={form.marca} onChange={handleChange} className="input border-2 border-gray-400 rounded-lg px-3 py-2" required>
    <option value="">Selecciona Marca</option>
    {marcasActuales.map((marca) => (
      <option key={marca} value={marca}>{marca}</option>
    ))}
  </select>

  {/* Modelo, oculto si PC + Marca Generico */}
  {!(form.tipo_equipo === "pc" && (form.marca?.toLowerCase() || "") === "generico") && (
    <input name="modelo" value={form.modelo} onChange={handleChange} placeholder="Modelo" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
  )}

  {/* Inputs para PC / Notebook */}
  {(form.tipo_equipo === "pc" || form.tipo_equipo === "notebook") && (
    <>
      <input name="nombre_equipo" value={form.nombre_equipo} onChange={handleChange} placeholder="Nombre de Equipo" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
      <input name="nombre_usuario" value={form.nombre_usuario} onChange={handleChange} placeholder="Nombre de Usuario" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
      <input name="windows" value={form.windows} onChange={handleChange} placeholder="Windows" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
      <input name="ver_win" value={form.ver_win} onChange={handleChange} placeholder="Versión Windows" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
      
      {/* Antivirus */}
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

      <input name="ram" value={form.ram} 
      onChange={(e) => {
          const valor = e.target.value;
          // Permite solo números vacíos o dígitos
          if (/^\d*$/.test(valor)) {
            setForm((prev) => ({ ...prev, ram: valor }));
          }
      }}
      placeholder="RAM (ej: 8)" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />

      <input name="cpu" value={form.cpu} onChange={handleChange} placeholder="CPU" className="input border-2 border-gray-400 rounded-lg px-3 py-2" />
      
      <input
        name="almacenamiento"
        value={form.almacenamiento}
        onChange={(e) => {
            const valor = e.target.value;
            // Permite solo números vacíos o dígitos
            if (/^\d*$/.test(valor)) {
            setForm((prev) => ({ ...prev, almacenamiento: valor }));
            }
        }}
        placeholder="Almacenamiento (ej: 256)"
        className="input border-2 border-gray-400 rounded-lg px-3 py-2"
       />

      {/* Tipo de almacenamiento */}
      <select name="tipo_almacenamiento" value={form.tipo_almacenamiento} onChange={handleChange} className="input border-2 border-gray-400 rounded-lg px-3 py-2">
        <option value="">Selecciona Tipo de Almacenamiento</option>
        {tiposAlmacenamiento.map((tipo) => (
          <option key={tipo} value={tipo}>{tipo}</option>
        ))}
      </select>
    </>
  )}

  {/* Inputs para Impresoras */}
  {form.tipo_equipo === "impresora" && (
    <div className="md:col-span-2 grid grid-cols-2 gap-4">
      
      {/* Tipo de conexión */}
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

      {/* IP solo si no es USB */}
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

  {/* Modal de éxito */}
  {mensaje.includes("✅") && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center">
        <p className="text-green-600 font-semibold mb-4">{mensaje}</p>
        <button
          onClick={() => setMensaje("")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          Cerrar
        </button>
      </div>
    </div>
  )}
</form>

      </div>

      {/* Modal de éxito */}
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
