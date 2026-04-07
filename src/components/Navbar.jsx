import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-yellow-400">
          myIMDB
        </Link>
        <div className="space-x-6">
          <Link to="/search" className="hover:text-yellow-400 transition">Keşfet</Link>
          <Link to="/library" className="hover:text-yellow-400 transition">Kütüphanem</Link>
          <Link to="/login" className="bg-yellow-400 text-slate-900 px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition">
            Giriş Yap
          </Link>
        </div>
      </div>
    </nav>
  );
}