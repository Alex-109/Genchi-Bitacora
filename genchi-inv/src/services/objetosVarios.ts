import axios from 'axios';
import type { 
  ObjetoVario, 
  CrearObjetoVarioRequest, 
  ActualizarObjetoVarioRequest,
  ObjetosVariosResponse,
  FiltrosObjetosVarios
} from '../types/objetosVarios';

const API_URL = import.meta.env.VITE_API_URL;

export const objetosVariosApi = {
  obtenerTodos: async (filters?: FiltrosObjetosVarios): Promise<ObjetosVariosResponse> => {
    const response = await axios.get(`${API_URL}/objetos-varios`, { params: filters });
    return response.data;
  },

  obtenerPorId: async (id: number): Promise<ObjetoVario> => {
    const response = await axios.get(`${API_URL}/objetos-varios/${id}`);
    return response.data.data;
  },

  crear: async (objeto: CrearObjetoVarioRequest): Promise<ObjetoVario> => {
    const response = await axios.post(`${API_URL}/objetos-varios`, objeto);
    return response.data.data;
  },

  actualizar: async (id: number, objeto: ActualizarObjetoVarioRequest): Promise<ObjetoVario> => {
    const response = await axios.put(`${API_URL}/objetos-varios/${id}`, objeto);
    return response.data.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/objetos-varios/${id}`);
  }
};
