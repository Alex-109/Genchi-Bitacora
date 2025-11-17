export interface ObjetoVario {
  id: number;
  nombre: string;
  unidad: string;
  comentarios?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearObjetoVarioRequest {
  nombre: string;
  unidad: string;
  comentarios?: string;
}

export interface ActualizarObjetoVarioRequest {
  nombre?: string;
  unidad?: string;
  comentarios?: string;
}

// ✅ NUEVAS INTERFACES PARA PAGINACIÓN
export interface PaginacionInfo {
  paginaActual: number;
  totalPaginas: number;
  totalObjetos: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ObjetosVariosResponse {
  success: boolean;
  data: ObjetoVario[];
  paginacion: PaginacionInfo;
}

export interface FiltrosObjetosVarios {
  unidad?: string;
  buscar?: string;
  fechaInicio?: string;
  fechaFin?: string;
  pagina?: number;
  limit?: number;
}