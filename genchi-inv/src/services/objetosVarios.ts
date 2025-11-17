import axios from 'axios';
import type { ObjetoVario, CrearObjetoVarioRequest, ActualizarObjetoVarioRequest } from '../types/objetosVarios';
const API_URL = 'http://localhost:5000/api/objetos-varios';

export const objetosVariosApi = {
  // Obtener todos los objetos varios
  obtenerTodos: async (filters?: { estado?: string; unidad?: string; buscar?: string }): Promise<ObjetoVario[]> => {
    const response = await axios.get(API_URL, { params: filters });
    return response.data.data;
  },

  // Obtener un objeto vario por ID
  obtenerPorId: async (id: number): Promise<ObjetoVario> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  // Crear nuevo objeto vario
  crear: async (objeto: CrearObjetoVarioRequest): Promise<ObjetoVario> => {
    const response = await axios.post(API_URL, objeto);
    return response.data.data;
  },

  // Actualizar objeto vario
  actualizar: async (id: number, objeto: ActualizarObjetoVarioRequest): Promise<ObjetoVario> => {
    const response = await axios.put(`${API_URL}/${id}`, objeto);
    return response.data.data;
  },

  // Eliminar objeto vario
  eliminar: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};