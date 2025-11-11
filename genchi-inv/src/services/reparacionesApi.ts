// src/services/reparacionesApi.ts
import axios from "axios";
import type { AxiosResponse } from "axios";
// Importa los tipos necesarios, incluyendo el nuevo tipo combinado
import type { HistorialCombinado, Reparacion } from "../types/equipo";

const API_BASE = `${process.env.REACT_APP_API_URL}/reparaciones`;

export interface IniciarReparacionPayload {
  id_equipo: number;
  cambios: Record<string, any>;
  obs?: string;
  rut?: string;
}

// Nota: La interfaz Reparacion ya la tenías definida o se importa de "../types"

/**
 * Iniciar una reparación.
 * Llama POST /api/reparaciones/iniciar con el body esperado por el backend.
 */
export const iniciarReparacion = (payload: IniciarReparacionPayload): Promise<AxiosResponse<Reparacion>> => {
  return axios.post(`${API_BASE}/iniciar`, payload);
};

/**
 * Obtener historial combinado de reparaciones e ingresos por id_equipo.
 * Llama GET /api/reparaciones?id_equipo=...
 * ✅ Devuelve la respuesta axios con el objeto combinado en res.data.
 */
export const obtenerReparacionesPorEquipo = (id_equipo: number): Promise<AxiosResponse<HistorialCombinado>> => {
  // ✅ CAMBIO CLAVE: Cambiar el tipo de retorno esperado de Reparacion[] a HistorialCombinado
  return axios.get(API_BASE, { params: { id_equipo } });
};
