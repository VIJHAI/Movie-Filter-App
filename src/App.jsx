import React, { useEffect, useState, useRef } from "react";
import FilterChips from "./FilterChips";
import MovieList from "./MovieList";
import { movies } from "./data";
import { motion, AnimatePresence } from "framer-motion";
import "./style.css";

const genres = [...new Set(movies.map((m) => m.genre))];
const ratings = [...new Set(movies.map((m) => m.rating))];
const years = [...new Set(movies.map((m) => m.year))];

export default function App() {
  const [filters, setFilters] = useState({ Genre: [], Rating: [], Year: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ movies: [], actors: [], tv: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState(() =>
    JSON.parse(localStorage.getItem("searchHistory")) || []
  );

  const inputRef = useRef();

  const handleToggle = (category, value) => {
    setFilters((prev) => {
      const updated = prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value];
      return { ...prev, [category]: updated };
    });
  };

  const filteredMovies = movies.filter((movie) => {
    const genreOk =
      filters.Genre.length === 0 ||
      filters.Genre.some((g) => g.toLowerCase() === (movie.genre ?? "").toLowerCase());

    const ratingOk =
      filters.Rating.length === 0 ||
      filters.Rating.some((r) => r.toString() === movie.rating.toString());

    const yearOk = filters.Year.length === 0 || filters.Year.includes(movie.year);

    return genreOk && ratingOk && yearOk;
  });

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() === "") {
        setSearchResults({ movies: [], actors: [], tv: [] });
        return;
      }

      setIsSearching(true);

      setTimeout(() => {
        const lower = searchQuery.toLowerCase();
        const matchedMovies = movies.filter((m) => m.title.toLowerCase().includes(lower));
        const matchedActors = movies.filter((m) =>
          m.actors?.some((a) => a.toLowerCase().includes(lower))
        );
        const matchedTV = movies.filter(
          (m) => m.type === "tv" && m.title.toLowerCase().includes(lower)
        );

        const updatedHistory = [
          searchQuery,
          ...searchHistory.filter((q) => q !== searchQuery),
        ].slice(0, 5);

        setSearchResults({
          movies: matchedMovies,
          actors: matchedActors,
          tv: matchedTV,
        });

        setSearchHistory(updatedHistory);
        localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
        setIsSearching(false);
        setHighlightIndex(0);
      }, 500);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const resultsFlat = [...searchResults.movies, ...searchResults.actors, ...searchResults.tv];

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % resultsFlat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev - 1 < 0 ? resultsFlat.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      const selected = resultsFlat[highlightIndex];
      if (selected) alert(`Selected: ${selected.title}`);
    }
  };

  return (
    <div className="app">
      <h1>🎬 Movie Filter App</h1>

      <input
        ref={inputRef}
        className="search-bar"
        type="text"
        placeholder="Search movies, actors, TV shows..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {searchHistory.length > 0 && !searchQuery && (
        <div className="history">
          <strong>Recent Searches:</strong>
          <ul>
            {searchHistory.map((item, index) => (
              <li key={index} onClick={() => setSearchQuery(item)}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <AnimatePresence>
        {searchQuery && (
          <motion.div
            className="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h3>🔍 Results for "{searchQuery}"</h3>

            {["movies", "actors", "tv"].map((cat) =>
              searchResults[cat].length > 0 ? (
                <div key={cat}>
                  <h4>
                    {cat === "movies" ? "🎬 Movies" : cat === "actors" ? "👤 Actors" : "📺 TV Shows"}
                  </h4>
                  <div className="movie-list">
                    {searchResults[cat].map((item, idx) => (
                      <motion.div
                        className={`movie-card ${
                          highlightIndex === resultsFlat.indexOf(item) ? "highlight" : ""
                        }`}
                        key={item.id}
                        layout
                      >
                        <strong>{item.title}</strong>
                        <p>
                          {item.genre} | {item.rating}⭐ | {item.year}
                        </p>
                        {item.actors && (
                          <p className="actors">
                            <em>Actors: {item.actors.join(", ")}</em>
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <FilterChips
        label="Genre"
        options={genres}
        selected={filters.Genre}
        onToggle={handleToggle}
      />
      <FilterChips
        label="Rating"
        options={ratings}
        selected={filters.Rating}
        onToggle={handleToggle}
      />
      <FilterChips
        label="Year"
        options={years}
        selected={filters.Year}
        onToggle={handleToggle}
      />

      {!searchQuery && <MovieList movies={filteredMovies} />}
    </div>
  );
}
