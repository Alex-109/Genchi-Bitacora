import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import FormularioEquipo from "./pages/FormularioRegistro";
import BusquedaEquipos from "./pages/BusquedaEquipos";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<BusquedaEquipos />} />
        <Route path="/registro" element={<FormularioEquipo />} />
        <Route path="/busqueda" element={<BusquedaEquipos />} />
      </Routes>
    </Router>
  );
}

export default App;