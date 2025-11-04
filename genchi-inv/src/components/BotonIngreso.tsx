// src/components/BotonIngreso.tsx

import { useState } from "react";
import type { Equipo } from "../types/equipo";
// 💡 NOTA IMPORTANTE: Asegúrate de que esta ruta sea correcta en tu proyecto.
// Podría ser: "../services/equipo" o "../api/equipo", etc.
import { registrarIngreso } from "../services/equiposApi";

interface Props {
  equipo: Equipo;
  onIngresoRegistrado: () => void; // callback para actualizar lista en la tarjeta
}

export default function BotonIngreso({ equipo, onIngresoRegistrado }: Props) {
  const [loading, setLoading] = useState(false);
  
  // En lugar de un estado local, usa directamente el estado del equipo
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
        flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full transition-colors shadow-md
        ${enProceso ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}
      `}
      title={enProceso ? "Ingreso registrado" : "Marcar como en proceso"}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : enProceso ? (
        "✅ En proceso"
      ) : (
        "🟢 Marcar ingreso"
      )}
    </button>
  );
}