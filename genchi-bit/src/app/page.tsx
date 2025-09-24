"use client";

import { supabase } from "@/lib/supabaseClient";

export default function Page() {
  const testConnection = async () => {
    const { data, error } = await supabase.from("tecnico").select("*").limit(1);
    if (error) {
      console.error("Error de conexión a Supabase:", error.message);
    } else {
      console.log("Conexión a Supabase exitosa:", data);
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) {
      console.error("Error al iniciar sesión con Google:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-4xl font-bold mb-8">Pruebas de Supabase y Tailwind</h1>
      <div className="flex flex-col space-y-4">
        <button
          onClick={testConnection}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Probar Conexión a Supabase
        </button>
        <button
          onClick={loginWithGoogle}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Iniciar Sesión con Google
        </button>
      </div>
    </div>
  );
}