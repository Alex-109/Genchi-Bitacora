import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface ItemCarrito {
  id: number;
  tipo: 'equipo' | 'objeto';
  tipo_equipo?: string;
  modelo?: string;
  marca?: string;
  nombre?: string;
  nombre_unidad?: string;
  unidad?: string;
}

interface CarritoContextType {
  carrito: ItemCarrito[];
  carritoAbierto: boolean;
  agregarAlCarrito: (item: ItemCarrito) => void;
  eliminarDelCarrito: (id: number) => void;
  limpiarCarrito: () => void;
  estaEnCarrito: (id: number) => boolean;
  toggleCarrito: () => void;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const agregarAlCarrito = (item: ItemCarrito) => {
    setCarrito(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const limpiarCarrito = () => setCarrito([]);

  const estaEnCarrito = (id: number) => carrito.some(item => item.id === id);

  const toggleCarrito = () => setCarritoAbierto(prev => !prev);
  const abrirCarrito = () => setCarritoAbierto(true);
  const cerrarCarrito = () => setCarritoAbierto(false);

  return (
    <CarritoContext.Provider value={{
      carrito,
      carritoAbierto,
      agregarAlCarrito,
      eliminarDelCarrito,
      limpiarCarrito,
      estaEnCarrito,
      toggleCarrito,
      abrirCarrito,
      cerrarCarrito
    }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
};