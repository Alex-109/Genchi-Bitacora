import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const linkClasses = (path: string) =>
    `px-4 py-2 rounded ${
      location.pathname === path
        ? "bg-indigo-600 text-white"
        : "hover:bg-indigo-200 transition-colors"
    }`;

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-center gap-4">
      <Link to="/" className={linkClasses("/")}>
        Búsqueda
      </Link>
      <Link to="/registro" className={linkClasses("/registro")}>
        Registrar Equipo
      </Link>
    </nav>
  );
}