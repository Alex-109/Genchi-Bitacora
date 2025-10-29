// src/components/BotonIngreso.tsx
import { useState } from "react";
import axios from "axios";
import type { Equipo } from "../types/equipo";

interface Props {
  equipo: Equipo;
  onIngresoRegistrado: () => void; // callback para actualizar lista en la tarjeta
}

const API_BASE = "http://localhost:5000/api/equipos";

export default function BotonIngreso({ equipo, onIngresoRegistrado }: Props) {
  const [loading, setLoading] = useState(false);
  const [registrado, setRegistrado] = useState(
    equipo.historial_ingresos?.some(h => h.estado === "en proceso") || false
  );

  const handleClick = async () => {
    if (registrado) return; // ya marcado
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/registrarIngreso`, {
        id: equipo.id,
        estado: "en proceso",
      });

      setRegistrado(true);
      onIngresoRegistrado(); // notificar a la tarjeta para refrescar si es necesario
    } catch (err) {
      console.error("Error al registrar ingreso:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || registrado}
      className={`
        flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full transition-colors shadow-md
        ${registrado ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}
      `}
      title={registrado ? "Ingreso registrado" : "Marcar como en proceso"}
    >
      {registrado ? "✅ En proceso" : "🟢 Marcar ingreso"}
    </button>
  );
}
