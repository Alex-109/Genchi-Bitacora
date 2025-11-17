import axios from 'axios';
import type { 
  ObjetoVario, 
  CrearObjetoVarioRequest, 
  ActualizarObjetoVarioRequest,
  ObjetosVariosResponse,
  FiltrosObjetosVarios
} from '../types/objetosVarios';

const API_URL = 'http://localhost:5000/api/objetos-varios';

export const objetosVariosApi = {
  // ⬅️ Ahora sí devuelve ObjetosVariosResponse
  obtenerTodos: async (filters?: FiltrosObjetosVarios): Promise<ObjetosVariosResponse> => {
    const response = await axios.get(API_URL, { params: filters });
    return response.data; // { success, data, paginacion }
  },

  obtenerPorId: async (id: number): Promise<ObjetoVario> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  },

  crear: async (objeto: CrearObjetoVarioRequest): Promise<ObjetoVario> => {
    const response = await axios.post(API_URL, objeto);
    return response.data.data;
  },

  actualizar: async (id: number, objeto: ActualizarObjetoVarioRequest): Promise<ObjetoVario> => {
    const response = await axios.put(`${API_URL}/${id}`, objeto);
    return response.data.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};
