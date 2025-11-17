import axios from 'axios';

interface PerfilEncargado {
  nombre: string;
  cargo: string;
}

interface ItemsActa {
  equiposIds: number[];
  objetosIds: number[];
}

const API_URL = import.meta.env.VITE_API_URL;

export const generarActaEntrega = async (
  idEquipo: number,
  perfil: PerfilEncargado
): Promise<void> => {
  try {
    const response = await axios.get(
      `${API_URL}/actas/acta-entrega/${idEquipo}`,
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

export const generarActaEntregaMultiple = async (
  items: ItemsActa,
  perfil: PerfilEncargado
): Promise<void> => {
  try {
    const response = await axios.post(
      `${API_URL}/actas/acta-entrega-multiple`,
      items,
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

export const generarActa = async (
  items: ItemsActa | number,
  perfil: PerfilEncargado
): Promise<void> => {
  if (typeof items === 'number') {
    return generarActaEntrega(items, perfil);
  } else {
    return generarActaEntregaMultiple(items, perfil);
  }
};
