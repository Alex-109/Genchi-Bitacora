import axios from "axios";
import type { Equipo } from "../types/equipo";

const API_URL = import.meta.env.VITE_API_URL;

export const crearEquipo = async (equipo: Omit<Equipo, "id" | "createdAt" | "updatedAt">) => {
  return axios.post(`${API_URL}/equipos`, equipo);
};

export const buscarEquipos = async (filtros: any) => {
  return axios.post(`${API_URL}/equipos/buscar`, filtros);
};

export const eliminarEquipoApi = async (id: number) => {
  return axios.delete(`${API_URL}/equipos/${id}`);
};

export const registrarIngreso = async (idEquipo: number, estado: string) => {
  return axios.post(`${API_URL}/equipos/${idEquipo}/ingreso`, { estado });
};

export const actualizarEstadoEquipo = async (id: number, estado: string) => {
  return axios.put(`${API_URL}/equipos`, {
    id: id,
    changes: { estado: estado }
  });
};

export const obtenerUltimosEquipos = async (limit: number = 10) => {
  return axios.get(`${API_URL}/equipos/ultimos`, { params: { limit } });
};
