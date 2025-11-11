// src/services/equiposApi.ts (Asumo que este es el nombre del archivo)

import axios from "axios";
import type { Equipo } from "../types/equipo";

const API_BASE = `${import.meta.env.VITE_API_URL}/equipos`;

// Crear equipo
export const crearEquipo = async (equipo: Omit<Equipo, "id" | "createdAt" | "updatedAt">) => {
  return axios.post(`${API_BASE}/crear`, equipo);
};

// Obtener unidades
// src/services/equiposApi.ts (Corrección)
// ...
export const obtenerUnidades = async () => {
  // ✅ Cambiado para devolver solo la propiedad .data
  const response = await axios.get(`${API_BASE}/unidades`);
  return response.data; // Esto ahora devuelve el array de objetos Unidad[]
};

// Buscar equipos con un solo objeto de filtros
export const buscarEquipos = async (filtros: any) => {
  return axios.post(`${API_BASE}/buscar`, filtros);
};

// Eliminar equipo
export const eliminarEquipoApi = async (id: number) => {
  return axios.delete(`${API_BASE}/eliminar/${id}`);
};

export const registrarIngreso = async (idEquipo: number, estado: string) => {
  // La ruta correcta era /ingreso/:idEquipo (según tu router)
  return axios.post(`${API_BASE}/ingreso/${idEquipo}`, { estado }); 
};

// ✅ CORREGIDO: 
// Actualizar estado (o cualquier campo) usando la ruta PUT /actualizar
// y enviando el body que el backend espera: { id, changes }
export const actualizarEstadoEquipo = async (id: number, estado: string) => {
  return axios.put(`${API_BASE}/actualizar`, { 
    id: id,
    changes: {
      estado: estado
    }
  });
};
