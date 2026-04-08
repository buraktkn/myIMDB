import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Kullanıcının giriş yapıp yapmadığını dinliyoruz
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Çıkış yapma fonksiyonu
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Çıkış yapınca ana sayfaya yönlendir
    } catch (error) {
      console.error("Çıkış yaparken hata:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-3xl font-bold tracking-tight text-slate-950 hover:text-yellow-600 transition duration-150">
          CineLog
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-sm font-medium text-slate-700 hover:text-yellow-600 transition">Keşfet</Link>
          <Link to="/library" className="text-sm font-medium text-slate-700 hover:text-yellow-600 transition">Kütüphanem</Link>
          
          {/* Akıllı Menü Kısmı: Kullanıcı varsa Profilini, yoksa Giriş Yap butonunu göster */}
          {user ? (
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
              <img 
                src={user.photoURL || "https://ui-avatars.com/api/?name=" + user.displayName} 
                alt="Profil" 
                className="w-8 h-8 rounded-full border border-slate-200"
              />
              <span className="text-sm font-semibold text-slate-700">
                {user.displayName?.split(" ")[0]} {/* Sadece ilk adını gösterir */}
              </span>
              <button 
                onClick={handleLogout}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-semibold bg-yellow-500 text-white shadow-sm hover:bg-yellow-600 transition ml-2">
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}