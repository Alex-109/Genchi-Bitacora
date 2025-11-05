// types/equipo.ts
export type TipoEquipo = 'pc' | 'notebook' | 'impresora' | 'todos';

export interface FiltrosComunes {
  marca?: string;
  unidad?: string;
  fecha?: string; // YYYY-MM-DD
}

export interface FiltrosPC {
  ram?: string;
  cpu?: string;
  almacenamiento?: string;
  tipo_almacenamiento?: string;
}

export interface FiltrosImpresora {
  toner?: string;
  drum?: string;
  conexion?: 'wifi' | 'ethernet' | 'usb' | '';
}

export interface BusquedaGeneral {
  query?: string; // num_inv, serie, ip, nombre_equipo
}

export interface HistorialIngreso {
  fecha: string;   // ISO date
  estado: "en proceso de reparacion" | "entregado";
}

export interface Reparacion {
    _id: string;
    id_equipo: number;
    rut: string;
    obs: string;
    cambios: Record<string, { antes: any; despues: any }>; 
    createdAt: string;
    updatedAt: string;
}

export interface HistorialCombinado {
    historial_reparaciones: Reparacion[];
    historial_ingresos: HistorialIngreso[];
}

export interface Equipo {
  id: number;
  tipo_equipo: TipoEquipo;
  nombre_equipo?: string;
  marca?: string;
  nombre_unidad?: string;
  serie?: string;
  num_inv?: string;
  ip?: string;
  modelo?: string;
  comentarios?: string;
  estado?: string;
  historial_ingresos?: HistorialIngreso[];

  // PC / Notebook
  windows?: string;
  ver_win?: string;
  antivirus?: string;
  ram?: number;  // ✅ CAMBIADO A number
  cpu?: string;
  almacenamiento?: number;  // ✅ CAMBIADO A number
  tipo_almacenamiento?: string;
  nombre_usuario?: string;  // ✅ MANTENER nombre_usuario (coherente con schema)

  // Impresora
  toner?: string;
  drum?: string;
  conexion?: string;

  createdAt?: string;
  updatedAt?: string;
}