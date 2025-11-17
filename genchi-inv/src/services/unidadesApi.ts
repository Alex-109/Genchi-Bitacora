import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const obtenerUnidades = async (): Promise<string[]> => {
  const res = await axios.get(`${API_URL}/unidades`);
  return res.data.map((unidad: { nombre_u: string }) => unidad.nombre_u);
};
