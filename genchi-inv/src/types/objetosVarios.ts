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