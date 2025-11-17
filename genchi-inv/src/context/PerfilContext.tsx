// src/context/PerfilContext.tsx
import React, { createContext, useContext, useState} from 'react';
import type { ReactNode } from 'react';

export interface Perfil {
  id: string;
  nombre: string;
  cargo: string;
  icono: string; // Emoji o URL de imagen
}

export const perfiles: Perfil[] = [
  {
    id: 'paola',
    nombre: 'PAOLA GUERRA CHANAY',
    cargo: 'Jefa de Informática',
    icono: '👩‍💻' // o URL de imagen
  },
  {
    id: 'hombre1',
    nombre: 'Patricio',
    cargo: 'Técnico',
    icono: '👨‍💻'
  },
  {
    id: 'hombre2', 
    nombre: 'Alejandro Fuentes',
    cargo: 'Tecnico',
    icono: '👨‍🔧'
  }
];

interface PerfilContextType {
  perfilSeleccionado: Perfil;
  seleccionarPerfil: (perfil: Perfil) => void;
}

const PerfilContext = createContext<PerfilContextType | undefined>(undefined);

export const PerfilProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<Perfil>(perfiles[0]);

  const seleccionarPerfil = (perfil: Perfil) => {
    setPerfilSeleccionado(perfil);
  };

  return (
    <PerfilContext.Provider value={{ perfilSeleccionado, seleccionarPerfil }}>
      {children}
    </PerfilContext.Provider>
  );
};

export const usePerfil = (): PerfilContextType => {
  const context = useContext(PerfilContext);
  if (!context) {
    throw new Error('usePerfil debe ser usado dentro de PerfilProvider');
  }
  return context;
};