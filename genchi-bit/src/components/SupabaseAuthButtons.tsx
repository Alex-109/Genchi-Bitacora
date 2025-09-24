// src/components/SupabaseAuthButtons.tsx
'use client';

import React from 'react';
import { supabase } from '../lib/supabaseClient';

export const SupabaseAuthButtons = () => {
  const testConnection = async () => {
    // Aquí puedes hacer una consulta simple a una de tus tablas, por ejemplo 'equipo'
    const { data, error } = await supabase.from("equipo").select("*").limit(1);

    if (error) {
      console.error("Error de conexión a Supabase:", error.message);
    } else {
      console.log("Conexión a Supabase exitosa:", data);
    }
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google" });

    if (error) {
      console.error("Error al iniciar sesión con Google:", error.message);
    } else {
      console.log("Iniciando sesión con Google...");
    }
  };

  return (
    <div className="w-full lg:w-1/4 p-4 lg:p-0 mt-8 lg:mt-0">
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Conexión y Autenticación</h3>
        <button
          onClick={testConnection}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors w-full"
        >
          Probar Conexión
        </button>
        <button
          onClick={loginWithGoogle}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors w-full"
        >
          Iniciar Sesión con Google
        </button>
      </div>
    </div>
  );
};