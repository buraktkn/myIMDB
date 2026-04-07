import { useState, useEffect } from "react";
import { searchContent } from "../services/tmdb";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect: 'query' her değiştiğinde (yani sen her harf yazdığında) tetiklenir
  useEffect(() => {
    // Eğer arama kutusu boşsa sonuçları temizle ve bekle
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Debounce: Kullanıcı yazmayı bıraktıktan 500ms sonra API'ye git
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      const data = await searchContent(query);
      
      // Sadece afişi olan dizi ve filmleri filtrele
      const filteredData = data.filter(
        (item) => item.poster_path && item.media_type !== "person"
      );
      
      setResults(filteredData);
      setLoading(false);
    }, 500);

    // Cleanup: Kullanıcı 500ms dolmadan yeni bir harf yazarsa, önceki geri sayımı iptal et
    return () => clearTimeout(delayDebounceFn);
  }, [query]); // Bu array [query] -> sadece arama kelimesi değişince çalış demek.

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Üst Kısım */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Ne İzlemek İstersin?</h1>
        <p className="opacity-70">
          Milyonlarca film ve dizi arasından arama yap, kütüphanene ekle.
        </p>
        
        {/* Artık form yerine sadece bir div ve input var. Butonu kaldırdık! */}
        <div className="max-w-2xl mx-auto mt-6 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Örn: Breaking Bad, Interstellar..."
            className="w-full px-6 py-4 rounded-xl border border-slate-300 bg-white shadow-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-slate-400 text-lg transition-shadow"
          />
          {/* Yükleniyor animasyonu metni (Sağ köşede tatlı bir detay) */}
          {loading && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
              Aranıyor...
            </div>
          )}
        </div>
      </div>

      {/* Alt Kısım: Sonuçlar */}
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
                <button className="w-full mt-3 py-2.5 text-xs font-bold bg-slate-100 hover:bg-yellow-400 hover:text-slate-900 text-slate-800 rounded transition-colors duration-200">
                  + Listeye Ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Sonuç Yoksa */}
      {results.length === 0 && !loading && query && (
         <p className="text-center opacity-50 pt-10 text-lg">"{query}" için bir sonuç bulunamadı.</p>
      )}
    </div>
  );
}