// src/services/reparacionesApi.ts
import axios from "axios";
import type { AxiosResponse } from "axios";

const API_BASE = "http://localhost:5000/api/reparaciones";

export interface IniciarReparacionPayload {
  id_equipo: number;
  cambios: Record<string, any>;
  obs?: string;
  rut?: string;
}

export interface Reparacion {
  _id?: string;
  id_equipo: number;
  rut?: string;
  obs?: string;
  cambios: Record<string, { antes: any; despues: any }>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Iniciar una reparación.
 * Llama POST /api/reparaciones/iniciar con el body esperado por el backend.
 * Devuelve la respuesta axios completa para que el componente pueda leer res.data.
 */
export const iniciarReparacion = (payload: IniciarReparacionPayload): Promise<AxiosResponse<Reparacion>> => {
  return axios.post(`${API_BASE}/iniciar`, payload);
};

/**
 * Obtener historial de reparaciones por id_equipo.
 * Llama GET /api/reparaciones?id_equipo=...
 * Devuelve la respuesta axios completa con array de reparaciones en res.data.
 */
export const obtenerReparacionesPorEquipo = (id_equipo: number): Promise<AxiosResponse<Reparacion[]>> => {
  return axios.get(API_BASE, { params: { id_equipo } });
};
