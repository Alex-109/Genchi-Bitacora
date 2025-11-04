// src/services/actasApi.ts
import axios from 'axios';

export const generarActaEntrega = async (idEquipo: number): Promise<void> => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/actas/acta-entrega/${idEquipo}`, // Ajusta el puerto
      {
        responseType: 'blob'
      }
    );

    // Crear y descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `acta-entrega-${idEquipo}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generando acta de entrega:', error);
    throw new Error('No se pudo generar el acta de entrega');
  }
};