import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const searchContent = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/multi`, {
      params: {
        api_key: API_KEY,
        query: query,
        language: "tr-TR",
        include_adult: false,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("TMDB API Hatası:", error);
    return [];
  }
};