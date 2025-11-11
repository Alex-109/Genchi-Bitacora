import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/unidades`;


export const obtenerUnidades = async (): Promise<string[]> => {
  const res = await axios.get(`${API_BASE}/`);
  return res.data.map((unidad: { nombre_u: string }) => unidad.nombre_u);
};
