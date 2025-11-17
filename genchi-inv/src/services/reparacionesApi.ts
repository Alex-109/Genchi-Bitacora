import axios from "axios";
import type { AxiosResponse } from "axios";
import type { HistorialCombinado, Reparacion } from "../types/equipo";

const API_URL = import.meta.env.VITE_API_URL;

export interface IniciarReparacionPayload {
  id_equipo: number;
  cambios: Record<string, any>;
  obs?: string;
  rut?: string;
}

export const iniciarReparacion = (payload: IniciarReparacionPayload): Promise<AxiosResponse<Reparacion>> => {
  return axios.post(`${API_URL}/reparaciones/iniciar`, payload);
};

export const obtenerReparacionesPorEquipo = (id_equipo: number): Promise<AxiosResponse<HistorialCombinado>> => {
  return axios.get(`${API_URL}/reparaciones`, { params: { id_equipo } });
};
