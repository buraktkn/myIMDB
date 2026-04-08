import { useState, useEffect } from "react";
import { searchContent } from "../services/tmdb";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Arama İşlemi (Debounce ile)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      const data = await searchContent(query);
      
      const filteredData = data.filter(
        (item) => item.poster_path && item.media_type !== "person"
      );
      
      setResults(filteredData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Listeye Ekleme Fonksiyonu
  const handleAddToList = async (item) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Listeye film eklemek için önce giriş yapmalısın!");
      return;
    }

    try {
      const movieRef = doc(db, "users", user.uid, "library", item.id.toString());

      await setDoc(movieRef, {
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        media_type: item.media_type,
        year: (item.release_date || item.first_air_date || "").substring(0, 4),
        addedAt: new Date(),
        status: "İzlenecek",
        rating: 0,
        personalNote: ""
      });

      alert(`"${item.title || item.name}" kütüphanene başarıyla eklendi!`);
    } catch (error) {
      console.error("Eklerken hata oluştu:", error);
      alert("Film eklenirken bir sorun oluştu.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Ne İzlemek İstersin?</h1>
        <p className="opacity-70">
          Milyonlarca film ve dizi arasından arama yap, kütüphanene ekle.
        </p>
        
        <div className="max-w-2xl mx-auto mt-6 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Örn: Breaking Bad, Interstellar..."
            className="w-full px-6 py-4 rounded-xl border border-slate-300 bg-white shadow-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-slate-400 text-lg transition-shadow"
          />
          {loading && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
              Aranıyor...
            </div>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((item) => (
            <div key={item.id} className="bg-white text-slate-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col">
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                className="w-full h-auto object-cover aspect-[2/3]"
              />
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm line-clamp-2 leading-snug" title={item.title || item.name}>
                    {item.title || item.name}
                  </h3>
                  <div className="flex justify-between items-center text-xs opacity-70 font-medium mt-1">
                    <span>{item.media_type === 'movie' ? 'Film' : 'Dizi'}</span>
                    <span>
                      {(item.release_date || item.first_air_date || "").substring(0, 4)}
                    </span>
                  </div>
                </div>
                {/* İşte hataya sebep olan ve artık kusursuz çalışan o buton */}
                <button 
                  onClick={() => handleAddToList(item)}
                  className="w-full mt-3 py-2.5 text-xs font-bold bg-slate-100 hover:bg-yellow-400 hover:text-slate-900 text-slate-800 rounded transition-colors duration-200"
                >
                  + Listeye Ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {results.length === 0 && !loading && query && (
         <p className="text-center opacity-50 pt-10 text-lg">"{query}" için bir sonuç bulunamadı.</p>
      )}
    </div>
  );
}