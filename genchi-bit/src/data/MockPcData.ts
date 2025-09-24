// src/data/MockPcData.ts
import { EquipoDB, PcDB } from '../types';

type MockDataCombined = EquipoDB & PcDB;

export const mockPcData: MockDataCombined[] = [
  {
    // Datos de EquipoDB
    serie: "DL2023001",
    modelo: "Dell Inspiron 15 3000",
    num_inv: "",
    ip: "",
    direccion: "",
    marca: "",
    
    // Datos de PcDB
    nombre_equipo: "Dell Inspiron 15 3000",
    usuario: "usuario-prueba",
    ver_win: "Windows 11",
    antivirus: "Windows Defender",
    specs: {
      cpu: "Intel Core i5-1135G7",
      ram: "8GB DDR4",
      gpu: "Sin GPU dedicada",
      gpuModel: "Intel Iris Xe Graphics",
      powerSupply: "65W AC Adapter",
      motherboard: "Dell 0K4CP7"
    }
  },
  //... continúa con el resto de los objetos, mapeando cada uno
];