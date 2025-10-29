import axios from "axios";
import type { Equipo } from "../types/equipo";

const API_BASE = "http://localhost:5000/api/equipos";

// Crear equipo
export const crearEquipo = async (equipo: Omit<Equipo, "id" | "createdAt" | "updatedAt">) => {
  return axios.post(`${API_BASE}/crear`, equipo);
};

// Obtener unidades
export const obtenerUnidades = async () => {
  return axios.get(`${API_BASE}/unidades`);
};

// Buscar equipos con un solo objeto de filtros
export const buscarEquipos = async (filtros: any) => {
  return axios.post(`${API_BASE}/buscar`, filtros);
};

// Eliminar equipo
export const eliminarEquipoApi = async (id: number) => {
  return axios.delete(`${API_BASE}/eliminar/${id}`);
};

// Registrar un nuevo ingreso
export const registrarIngreso = async (id: number) => {
  return axios.post(`${API_BASE}/${id}/ingreso`);
};

