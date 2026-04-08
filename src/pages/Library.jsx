import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Library() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // onAuthStateChanged: Kullanıcının giriş durumunu anlık olarak dinler
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Kullanıcı giriş yapmışsa, Firestore'dan onun kütüphanesini çek
        try {
          const libraryRef = collection(db, "users", user.uid, "library");
          const querySnapshot = await getDocs(libraryRef);
          
          // Gelen karmaşık veriyi bizim kullanabileceğimiz bir diziye (array) çevir
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
        // Kullanıcı giriş yapmamışsa yüklemeyi bitir
        setLoading(false);
      }
    });

    // Component kapandığında dinlemeyi durdur (Performans için)
    return () => unsubscribe();
  }, []);

  // 1. Durum: Veriler çekilirken gösterilecek ekran
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // 2. Durum: Kullanıcı giriş yapmamışsa gösterilecek ekran
  if (!auth.currentUser) {
    return (
      <div className="text-center mt-20 space-y-6">
        <h2 className="text-3xl font-bold text-slate-800">Kütüphanene Erişmek İçin Giriş Yap</h2>
        <p className="text-slate-500">Film ve dizi koleksiyonunu görmek için oturum açmalısın.</p>
        <button 
          onClick={() => navigate("/login")}
          className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-lg"
        >
          Giriş Yap Sayfasına Git
        </button>
      </div>
    );
  }

  // 3. Durum: Kullanıcı giriş yapmış ve veriler gelmişse (Ana Ekran)
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Üst Kısım: Başlık ve Sayaç */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kütüphanem</h1>
          <p className="text-slate-500 mt-2">Kaydettiğin tüm dizi ve filmler burada.</p>
        </div>
        <div className="text-sm font-bold text-yellow-700 bg-yellow-100 px-4 py-2 rounded-lg">
          {movies.length} İçerik
        </div>
      </div>

      {/* Alt Kısım: Filmler veya Boş Ekran */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="bg-white text-slate-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow border border-slate-100 flex flex-col">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto object-cover aspect-[2/3]"
              />
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm line-clamp-2 leading-snug">{movie.title}</h3>
                  <div className="text-xs text-slate-500 mt-1.5 font-medium">
                    {movie.year} • {movie.media_type === 'movie' ? 'Film' : 'Dizi'}
                  </div>
                </div>
                
                {/* Durum Etiketi */}
                <div className="inline-flex justify-center px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
                  {movie.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Filmi Yoksa Gösterilecek Boş Durum (Empty State)
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