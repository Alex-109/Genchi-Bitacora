// src/services/actasApi.ts
import axios from 'axios';

export const generarActaEntrega = async (idEquipo: number): Promise<void> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/actas/acta-entrega/${idEquipo}`, // Ajusta el puerto
      {
        responseType: 'blob'
      }
    );

    // *** CAMBIO CLAVE AQUI ***
    // 1. Intentar obtener el nombre del archivo de la cabecera Content-Disposition
    let nombreArchivo = `acta-entrega-${idEquipo}.docx`; // Fallback
    const contentDisposition = response.headers['content-disposition'];

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+?)"/i);
      if (filenameMatch && filenameMatch[1]) {
        nombreArchivo = filenameMatch[1];
      }
    }
    // *** FIN DEL CAMBIO ***

    // Crear y descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Usar el nombre de archivo obtenido
    link.setAttribute('download', nombreArchivo);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generando acta de entrega:', error);
    throw new Error('No se pudo generar el acta de entrega');
  }
};
