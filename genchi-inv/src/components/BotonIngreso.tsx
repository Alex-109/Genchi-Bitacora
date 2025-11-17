// src/components/BotonIngreso.tsx

import { useState } from "react";
import type { Equipo } from "../types/equipo";
import { registrarIngreso } from "../services/equiposApi";

interface Props {
  equipo: Equipo;
  onIngresoRegistrado: () => void;
}

export default function BotonIngreso({ equipo, onIngresoRegistrado }: Props) {
  const [loading, setLoading] = useState(false);
  
  const enProceso = equipo.estado === "en proceso de reparacion";

  const handleClick = async () => {
    if (enProceso) return; 
    setLoading(true);

    try {
      console.log('Registrando ingreso para equipo:', equipo.id);
      await registrarIngreso(equipo.id!, "en proceso de reparacion");
      onIngresoRegistrado(); 
    } catch (err) {
      console.error("Error al registrar ingreso:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || enProceso}
      className={`
        flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 shadow-sm
        ${enProceso 
          ? "bg-green-100 text-green-800 border border-green-300 cursor-default" 
          : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 hover:border-blue-700"
        }
        ${loading ? "opacity-70 cursor-not-allowed" : ""}
      `}
      title={enProceso ? "Ingreso registrado" : "Marcar como en proceso"}
    >
      {loading ? (
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>...</span>
        </div>
      ) : enProceso ? (
        <div className="flex items-center gap-1">
          <span>✅</span>
          <span>En proceso</span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span>🟢</span>
          <span>Marcar ingreso</span>
        </div>
      )}
    </button>
  );
}