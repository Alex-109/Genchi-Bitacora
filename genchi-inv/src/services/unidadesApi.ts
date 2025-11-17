// src/services/unidadesApi.ts - CORREGIDO
import axios from "axios";

const API_BASE = "http://localhost:5000/api/unidades";

export const obtenerUnidades = async (): Promise<string[]> => {
  const res = await axios.get(API_BASE); // ✅ QUITA el "/" extra
  return res.data.map((unidad: { nombre_u: string }) => unidad.nombre_u);
};