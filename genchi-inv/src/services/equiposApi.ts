// src/services/equiposApi.ts - VERSIÓN CORREGIDA
import axios from "axios";
import type { Equipo } from "../types/equipo";

const API_BASE = "http://localhost:5000/api/equipos";

// ✅ CORREGIDO: Crear equipo
export const crearEquipo = async (equipo: Omit<Equipo, "id" | "createdAt" | "updatedAt">) => {
  return axios.post(API_BASE, equipo); // ✅ QUITA "/crear"
};

// ✅ CORREGIDO: Usar servicio de unidades correcto
export const obtenerUnidades = async () => {
  // ❌ ELIMINA ESTO - usa el servicio de unidades separado
  throw new Error("Usar unidadesApi.obtenerUnidades() en lugar de esto");
};

// ✅ CORRECTO: Buscar equipos
export const buscarEquipos = async (filtros: any) => {
  return axios.post(`${API_BASE}/buscar`, filtros);
};

// ✅ CORREGIDO: Eliminar equipo
export const eliminarEquipoApi = async (id: number) => {
  return axios.delete(`${API_BASE}/${id}`); // ✅ QUITA "/eliminar"
};

// ✅ CORRECTO: Registrar ingreso
export const registrarIngreso = async (idEquipo: number, estado: string) => {
  return axios.post(`${API_BASE}/${idEquipo}/ingreso`, { estado });
};

// ✅ CORRECTO: Actualizar estado
export const actualizarEstadoEquipo = async (id: number, estado: string) => {
  return axios.put(API_BASE, {
    id: id,
    changes: { estado: estado }
  });
};

// ✅ Obtener últimos equipos
export const obtenerUltimosEquipos = async (limit: number = 10) => {
  return axios.get(`${API_BASE}/ultimos`, { 
    params: { limit } 
  });
};