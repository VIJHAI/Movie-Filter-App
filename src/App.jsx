import React, { useEffect, useState, useRef } from "react";
import FilterChips from "./FilterChips";
import { movies } from "./data";
import { motion, AnimatePresence } from "framer-motion";
import "./style.css";

const genres = [...new Set(movies.map((m) => m.genre))];
const ratings = [...new Set(movies.map((m) => m.rating))];
const years = [...new Set(movies.map((m) => m.year))];

export default function App() {
  const [filters, setFilters] = useState({ Genre: [], Rating: [], Year: [] });
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("reviews");
    return saved ? JSON.parse(saved) : {};
  });
  const [drafts, setDrafts] = useState(() => {
    const saved = localStorage.getItem("drafts");
    return saved ? JSON.parse(saved) : {};
  });
  const [editingReview, setEditingReview] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [sortType, setSortType] = useState("recent");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ movies: [], actors: [], tv: [] });
  const [searchHistory, setSearchHistory] = useState(() =>
    JSON.parse(localStorage.getItem("searchHistory")) || []
  );

  const [highlightIndex, setHighlightIndex] = useState(0);
  const [flatResults, setFlatResults] = useState([]);
  const inputRef = useRef();

  // Update localStorage when reviews change
  useEffect(() => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }, [reviews]);

  // Update localStorage when drafts change
  useEffect(() => {
    localStorage.setItem("drafts", JSON.stringify(drafts));
  }, [drafts]);

  const handleToggle = (category, value) => {
    setFilters((prev) => {
      const updated = prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value];
      return { ...prev, [category]: updated };
    });
  };

  const handleReviewSubmit = (movieId, text) => {
    if (!text.trim()) return;
    const newReview = {
      id: Date.now(),
      text,
      date: new Date().toISOString(),
      votes: 0,
    };
    setReviews((prev) => ({
      ...prev,
      [movieId]: [...(prev[movieId] || []), newReview],
    }));
    setDrafts((prev) => {
      const updated = { ...prev };
      delete updated[movieId];
      return updated;
    });
  };

  const handleEdit = (movieId, reviewId, newText) => {
    setReviews((prev) => ({
      ...prev,
      [movieId]: prev[movieId].map((r) =>
        r.id === reviewId ? { ...r, text: newText } : r
      ),
    }));
    setEditingReview(null);
    setEditingText("");
  };

  const handleDelete = (movieId, reviewId) => {
    setReviews((prev) => ({
      ...prev,
      [movieId]: prev[movieId].filter((r) => r.id !== reviewId),
    }));
  };

  const handleVote = (movieId, reviewId, delta) => {
    setReviews((prev) => ({
      ...prev,
      [movieId]: prev[movieId].map((r) =>
        r.id === reviewId ? { ...r, votes: r.votes + delta } : r
      ),
    }));
  };

  const sortedReviews = (movieId) => {
    const list = reviews[movieId] || [];
    return sortType === "recent"
      ? [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
      : [...list].sort((a, b) => b.votes - a.votes);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchQuery.trim()) {
        setSearchResults({ movies: [], actors: [], tv: [] });
        setFlatResults([]);
        return;
      }
      const lower = searchQuery.toLowerCase();
      const matchedMovies = movies.filter((m) =>
        m.title.toLowerCase().includes(lower)
      );
      const matchedActors = movies.filter((m) =>
        m.actors?.some((a) => a.toLowerCase().includes(lower))
      );
      const matchedTV = movies.filter(
        (m) => m.type === "tv" && m.title.toLowerCase().includes(lower)
      );

      const combinedFlat = [
        ...matchedMovies.map((m) => ({ ...m, typeMatch: "Movie" })),
        ...matchedActors.map((m) => ({ ...m, typeMatch: "Actor" })),
        ...matchedTV.map((m) => ({ ...m, typeMatch: "TV Show" })),
      ];

      setSearchResults({
        movies: matchedMovies,
        actors: matchedActors,
        tv: matchedTV,
      });
      setFlatResults(combinedFlat);
      setHighlightIndex(0);

      const updatedHistory = [
        searchQuery,
        ...searchHistory.filter((q) => q !== searchQuery),
      ].slice(0, 5);
      setSearchHistory(updatedHistory);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (!flatResults.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev === 0 ? flatResults.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[highlightIndex]) {
        const selected = flatResults[highlightIndex];
        alert(`Selected: ${selected.title}`);
        setSearchQuery(selected.title);
        setFlatResults([]);
      }
    }
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

  return (
    <div className="app">
      <h1>🎬 Movie Filter & Review App</h1>

      <input
        ref={inputRef}
        className="search-bar"
        type="text"
        placeholder="Search movies, actors, TV shows..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ backgroundColor: "#fff", color: "#000" }}
      />

      {searchQuery.trim() === "" && searchHistory.length > 0 && (
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
        {searchQuery.trim() && flatResults.length > 0 && (
          <motion.div
            className="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h3>🔍 Results for "{searchQuery}"</h3>
            <div className="movie-list">
              {flatResults.map((item, i) => (
                <motion.div
                  key={item.id + "-" + i}
                  className={`movie-card ${highlightIndex === i ? "highlight" : ""}`}
                  layout
                >
                  <h3>{item.title}</h3>
                  <p>{item.genre} | {item.rating}⭐ | {item.year}</p>
                  <p className="actors">
                    <em>Actors: {item.actors?.join(", ")}</em>
                  </p>
                  <p><strong>Type: {item.typeMatch}</strong></p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FilterChips label="Genre" options={genres} selected={filters.Genre} onToggle={handleToggle} />
      <FilterChips label="Rating" options={ratings} selected={filters.Rating} onToggle={handleToggle} />
      <FilterChips label="Year" options={years} selected={filters.Year} onToggle={handleToggle} />

      <div className="sort-toggle">
        <label>Sort Reviews By: </label>
        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="recent">🕒 Most Recent</option>
          <option value="votes">👍 Most Helpful</option>
        </select>
      </div>

      {filteredMovies.map((movie) => (
        <motion.div className="movie-card review-mode" layout key={movie.id}>
          <h3>{movie.title}</h3>
          <p>{movie.genre} | {movie.rating}⭐ | {movie.year}</p>

          <div className="review-section">
            <textarea
              value={drafts[movie.id] || ""}
              onChange={(e) =>
                setDrafts((prev) => ({ ...prev, [movie.id]: e.target.value }))
              }
              placeholder="Write a review..."
            />
            <button onClick={() => handleReviewSubmit(movie.id, drafts[movie.id] || "")}>
              Submit Review
            </button>

            {sortedReviews(movie.id).map((rev) => (
              <motion.div key={rev.id} className="review-item" layout>
                {editingReview === rev.id ? (
                  <>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      autoFocus
                    />
                    <button onClick={() => handleEdit(movie.id, rev.id, editingText)}>Save</button>
                    <button onClick={() => setEditingReview(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <p>{rev.text}</p>
                    <div className="review-actions">
                      <span>{new Date(rev.date).toLocaleString()}</span>
                      <button onClick={() => handleVote(movie.id, rev.id, 1)}>⬆️ {rev.votes}</button>
                      <button onClick={() => handleVote(movie.id, rev.id, -1)}>⬇️</button>
                      <button onClick={() => {
                        setEditingReview(rev.id);
                        setEditingText(rev.text);
                      }}>✏️ Edit</button>
                      <button onClick={() => handleDelete(movie.id, rev.id)}>🗑️ Delete</button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
