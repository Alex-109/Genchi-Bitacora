import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import FormularioEquipo from "./pages/FormularioRegistro";
import BusquedaEquipos from "./pages/BusquedaEquipos";
import { PerfilProvider } from "./context/PerfilContext";
import SelectorPerfil from "./components/SelectorPerfil";
import ObjetosVarios from "./pages/ObjetosVarios";
import { CarritoProvider } from "./context/CarritoContext";
import { useEffect } from "react";

function App() {
  // ✅ Cambiar favicon al cargar la app - RUTAS CORREGIDAS
  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = '/genchi.ico'; // ✅ Ruta corregida
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  return (
    <PerfilProvider>
      <CarritoProvider>
        <Router>
          {/* ✅ Fondo de Gendarmería - RUTA CORREGIDA */}
          <div 
            className="min-h-screen bg-cover bg-center bg-fixed"
            style={{ backgroundImage: 'url(/Fondo_Genchi.jpg)' }} // ✅ Ruta corregida
          >
            <Navbar />
            <SelectorPerfil />
            <main className="relative z-10">
              <Routes>
                <Route path="/" element={<Navigate to="/busqueda" replace />} />
                <Route path="/registro" element={<FormularioEquipo />} />
                <Route path="/busqueda" element={<BusquedaEquipos />} />
                <Route path="/objetos-varios" element={<ObjetosVarios />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CarritoProvider>
    </PerfilProvider>
  );
}

export default App;