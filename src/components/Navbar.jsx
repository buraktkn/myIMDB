import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-3xl font-bold tracking-tight text-slate-950 hover:text-yellow-600 transition duration-150">
          myIMDB
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-sm font-medium text-slate-700 hover:text-yellow-600 transition">Keşfet</Link>
          <Link to="/library" className="text-sm font-medium text-slate-700 hover:text-yellow-600 transition">Kütüphanem</Link>
          <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-semibold bg-yellow-600 text-white shadow-md hover:bg-yellow-700 transition">
            Giriş Yap
          </Link>
        </div>
      </div>
    </nav>
  );
}