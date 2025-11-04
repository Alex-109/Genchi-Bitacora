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
  fecha: string;   // ISO date
  estado: "en proceso de reparacion" | "entregado";
}

// 🆕 INTERFACE AÑADIDA: Define la estructura de una Reparación individual
export interface Reparacion {
    _id: string;
    id_equipo: number;
    rut: string;
    obs: string;
    // La estructura de cambios que registra el antes y después de un atributo
    cambios: Record<string, { antes: any; despues: any }>; 
    createdAt: string; // Fecha de la reparación
    updatedAt: string;
}

// 🆕 INTERFACE AÑADIDA: Define la respuesta combinada del endpoint de historial
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
  ram?: string;
  cpu?: string;
  almacenamiento?: string;
  tipo_almacenamiento?: string;
  nombre_usuario?: string;

  // Impresora
  toner?: string;
  drum?: string;
  conexion?: string;

  createdAt?: string;
  updatedAt?: string;
}