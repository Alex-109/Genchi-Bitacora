// src/services/reparacionesApi.ts - CORREGIDO
import axios from "axios";
import type { AxiosResponse } from "axios";
import type { HistorialCombinado, Reparacion } from "../types/equipo";

const API_BASE = "http://localhost:5000/api/reparaciones";

export interface IniciarReparacionPayload {
  id_equipo: number;
  cambios: Record<string, any>;
  obs?: string;
  rut?: string;
}

/**
 * Iniciar una reparación.
 */
export const iniciarReparacion = (payload: IniciarReparacionPayload): Promise<AxiosResponse<Reparacion>> => {
  return axios.post(`${API_BASE}/iniciar`, payload); // ✅ CORRECTO
};

/**
 * Obtener historial combinado de reparaciones e ingresos por id_equipo.
 * ✅ CORREGIDO: Usa parámetros de query correctamente
 */
export const obtenerReparacionesPorEquipo = (id_equipo: number): Promise<AxiosResponse<HistorialCombinado>> => {
  return axios.get(API_BASE, { 
    params: { id_equipo } // ✅ CORRECTO: GET /api/reparaciones?id_equipo=123
  });
};