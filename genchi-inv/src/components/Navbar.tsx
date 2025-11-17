import { Link, useLocation } from "react-router-dom";
import Carrito from "./Carrito";
import { useCarrito } from "../context/CarritoContext";
import { ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const { carrito, carritoAbierto, toggleCarrito, cerrarCarrito } = useCarrito();

  const linkClasses = (path: string) =>
    `px-4 py-2 rounded transition-colors ${
      location.pathname === path
        ? "bg-yellow-500 text-gray-900 font-semibold" // Amarillo activo
        : "text-white hover:bg-green-700" // Verde oscuro hover
    }`;

  return (
    <div className="sticky top-0 z-40">
      <nav className="bg-green-800 text-white p-4 flex justify-between items-center shadow-lg">
        {/* Logo a la izquierda */}
        <div className="flex items-center">
          <img 
            src="/Logo_navbar.png" 
            alt="Gendarmería de Chile" 
            className="h-10 w-auto"
          />
        </div>

        {/* ✅ Navegación CENTRADA */}
        <div className="flex-1 flex justify-center">
          <div className="flex gap-3">
            <Link to="/registro" className={linkClasses("/registro")}>
              Registrar Equipo
            </Link>
            <Link to="/busqueda" className={linkClasses("/busqueda")}>
              Búsqueda
            </Link>
            <Link to="/objetos-varios" className={linkClasses("/objetos-varios")}>
              Objetos Varios
            </Link>
          </div>
        </div>

        {/* Ícono del carrito a la derecha */}
        <div className="relative">
          <button
            onClick={toggleCarrito}
            className="relative p-2 rounded-full hover:bg-green-700 transition-colors group"
          >
            <ShoppingCart className="w-6 h-6 text-white group-hover:text-yellow-200 transition-colors" />
            
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg">
                {carrito.length}
              </span>
            )}
          </button>

          {/* Dropdown del carrito */}
          <Carrito isOpen={carritoAbierto} onClose={cerrarCarrito} />
        </div>
      </nav>
    </div>
  );
}