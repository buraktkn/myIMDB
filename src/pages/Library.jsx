import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"; // deleteDoc eklendi
import { onAuthStateChanged } from "firebase/auth";

export default function Library() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Verileri Çekme
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const libraryRef = collection(db, "users", user.uid, "library");
          const querySnapshot = await getDocs(libraryRef);
          
          const userMovies = [];
          querySnapshot.forEach((doc) => {
            userMovies.push(doc.data());
          });
          
          setMovies(userMovies);
        } catch (error) {
          console.error("Filmler çekilirken hata:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Güncelleme Fonksiyonu (Durum ve Puan İçin)
  const handleUpdate = async (movieId, field, value) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const movieRef = doc(db, "users", user.uid, "library", movieId.toString());
      await updateDoc(movieRef, { [field]: value });

      setMovies((prevMovies) => 
        prevMovies.map((movie) => 
          movie.id === movieId ? { ...movie, [field]: value } : movie
        )
      );
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Değişiklik kaydedilemedi.");
    }
  };

  // 3. SİLME FONKSİYONU (YENİ EKLENDİ)
  const handleDelete = async (movieId, title) => {
    // Kullanıcıya yanlışlıkla tıklamalara karşı bir onay soralım
    const isConfirmed = window.confirm(`"${title}" adlı içeriği kütüphanenden silmek istediğine emin misin?`);
    if (!isConfirmed) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Firestore'dan sil
      const movieRef = doc(db, "users", user.uid, "library", movieId.toString());
      await deleteDoc(movieRef);

      // Ekrandan anında kaybet
      setMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Film silinirken bir hata oluştu.");
    }
  };

  // Yükleniyor Ekranı
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // Giriş Yapılmamış Ekranı
  if (!auth.currentUser) {
    return (
      <div className="text-center mt-20 space-y-6">
        <h2 className="text-3xl font-bold text-slate-800">Kütüphanene Erişmek İçin Giriş Yap</h2>
        <button 
          onClick={() => navigate("/login")}
          className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
        >
          Giriş Yap Sayfasına Git
        </button>
      </div>
    );
  }

  // Ana Ekran
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kütüphanem</h1>
          <p className="text-slate-500 mt-2">Kaydettiğin tüm dizi ve filmler burada.</p>
        </div>
        <div className="text-sm font-bold text-yellow-700 bg-yellow-100 px-4 py-2 rounded-lg">
          {movies.length} İçerik
        </div>
      </div>

      {movies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            // relative class'ı silme butonunun sağ üste oturması için kritik
            <div key={movie.id} className="relative bg-white text-slate-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow border border-slate-100 flex flex-col group">
              
              {/* SİLME BUTONU: Normalde gizli, fareyle kartın üstüne gelince (group-hover) ortaya çıkar */}
              <button
                onClick={() => handleDelete(movie.id, movie.title)}
                className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg"
                title="Listeden Kaldır"
              >
                ✕
              </button>

              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto object-cover aspect-[2/3]"
              />
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-sm line-clamp-2 leading-snug">{movie.title}</h3>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {movie.year} • {movie.media_type === 'movie' ? 'Film' : 'Dizi'}
                  </div>
                </div>
                
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <select
                    value={movie.status || "İzlenecek"}
                    onChange={(e) => handleUpdate(movie.id, "status", e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 rounded-md py-2 px-2 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                  >
                    <option value="İzlenecek">İzlenecek</option>
                    <option value="İzleniyor">İzleniyor</option>
                    <option value="İzlendi">İzlendi</option>
                  </select>

                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleUpdate(movie.id, "rating", star)}
                        className={`text-xl hover:scale-125 transition-transform duration-200 ${
                          (movie.rating || 0) >= star ? "text-yellow-400" : "text-slate-200"
                        }`}
                        title={`${star} Puan Ver`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="text-6xl mb-4">🍿</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Kütüphanen çok ıssız</h3>
          <p className="text-slate-500 mb-6">Henüz listene hiçbir şey eklememişsin.</p>
          <button 
            onClick={() => navigate("/search")}
            className="text-yellow-600 font-bold hover:text-yellow-700 px-6 py-2 bg-yellow-50 rounded-lg transition"
          >
            Hemen bir şeyler keşfet!
          </button>
        </div>
      )}
    </div>
  );
}