export type TipoEquipo = 'pc' | 'notebook' | 'impresora' | 'todos';

export interface FiltrosComunes {
  marca?: string;
  unidad?: string;
  fecha?: string; // YYYY-MM-DD
}

export interface FiltrosPC {
  windows?: '10' | '11';
  ver_win?: string;
  antivirus?: 'si' | 'no';
  ram?: string;
  cpu?: string;
  almacenamiento?: string;
  tipoAlmacenamiento?: string;
}

export interface FiltrosImpresora {
  toner?: string;
  drum?: string;
  conexion?: 'wifi' | 'ethernet' | 'usb' | '';
}

export interface BusquedaGeneral {
  query?: string; // num_inv, serie, ip, nombre_equipo
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
