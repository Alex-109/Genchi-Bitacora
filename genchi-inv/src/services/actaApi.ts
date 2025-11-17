// src/services/actasApi.ts
import axios from 'axios';

// Tipos para los datos del acta
interface PerfilEncargado {
  nombre: string;
  cargo: string;
}

interface ItemsActa {
  equiposIds: number[];
  objetosIds: number[];
}

// ✅ SERVICIO PARA ACTA INDIVIDUAL (mantener compatibilidad)
export const generarActaEntrega = async (
  idEquipo: number, 
  perfil: PerfilEncargado
): Promise<void> => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/actas/acta-entrega/${idEquipo}`,
      {
        responseType: 'blob',
        params: {
          encargado: perfil.nombre,
          cargo: perfil.cargo
        }
      }
    );

    let nombreArchivo = `acta-entrega-${idEquipo}.docx`;
    const contentDisposition = response.headers['content-disposition'];

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+?)"/i);
      if (filenameMatch && filenameMatch[1]) {
        nombreArchivo = filenameMatch[1];
      }
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generando acta de entrega individual:', error);
    throw new Error('No se pudo generar el acta de entrega');
  }
};

// ✅ NUEVO SERVICIO PARA ACTA MÚLTIPLE (desde carrito)
export const generarActaEntregaMultiple = async (
  items: ItemsActa,
  perfil: PerfilEncargado
): Promise<void> => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/actas/acta-entrega-multiple`, // ✅ Ruta correcta
      items, // { equiposIds: [], objetosIds: [] }
      {
        responseType: 'blob',
        params: {
          encargado: perfil.nombre,
          cargo: perfil.cargo
        }
      }
    );

    let nombreArchivo = `acta-entrega-multiple.docx`;
    const contentDisposition = response.headers['content-disposition'];

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+?)"/i);
      if (filenameMatch && filenameMatch[1]) {
        nombreArchivo = filenameMatch[1];
      }
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nombreArchivo);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generando acta de entrega múltiple:', error);
    throw new Error('No se pudo generar el acta de entrega múltiple');
  }
};

// ✅ SERVICIO COMBINADO (opcional - para facilitar uso)
export const generarActa = async (
  items: ItemsActa | number,
  perfil: PerfilEncargado
): Promise<void> => {
  if (typeof items === 'number') {
    return await generarActaEntrega(items, perfil);
  } else {
    return await generarActaEntregaMultiple(items, perfil);
  }
};