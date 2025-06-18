// src/SearchBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { mockSearch } from "./mockSearchApi";
import { motion, AnimatePresence } from "framer-motion";
import "./style.css"; // Ensure it has styles for .search-results, etc.

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ movies: [], actors: [], shows: [] });
  const [showResults, setShowResults] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (query.trim() === "") {
      setResults({ movies: [], actors: [], shows: [] });
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      mockSearch(query).then((res) => {
        setResults(res);
        setShowResults(true);
      });
    }, 400);
  }, [query]);

  return (
    <div className="search-container">
      <input
        className="search-input"
        type="text"
        placeholder="🔍 Search movies, actors, or shows..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query && setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
      />

      <AnimatePresence>
        {showResults && (
          <motion.div
            className="search-results"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {["movies", "actors", "shows"].map((type) => (
              results[type].length > 0 && (
                <div key={type} className="result-section">
                  <h4>{type.toUpperCase()}</h4>
                  {results[type].map((item) => (
                    <div key={item.id} className="result-item">
                      {type === "movies" && (
                        <div>
                          <strong>{item.title}</strong> ({item.year}) - {item.genre} - ⭐{item.rating}
                        </div>
                      )}
                      {type === "actors" && <div>{item.name}</div>}
                      {type === "shows" && (
                        <div>
                          <strong>{item.title}</strong> ({item.year})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ))}
            {results.movies.length === 0 && results.actors.length === 0 && results.shows.length === 0 && (
              <div className="no-results">No results found.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
