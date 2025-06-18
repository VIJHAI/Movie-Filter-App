import React, { useState } from "react";
import FilterChips from "./FilterChips";
import MovieList from "./MovieList";
import { movies } from "./data";
import "./style.css";

const genres = [...new Set(movies.map((m) => m.genre))];
const ratings = [...new Set(movies.map((m) => m.rating))];
const years = [...new Set(movies.map((m) => m.year))];

export default function App() {
  const [filters, setFilters] = useState({
    Genre: [],
    Rating: [],
    Year: [],
  });

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
      filters.Genre.some(
        (g) => g.toLowerCase() === (movie.genre ?? "").toLowerCase()
      );

    const ratingOk =
      filters.Rating.length === 0 ||
      filters.Rating.some((r) => r.toString() === movie.rating.toString());

    const yearOk =
      filters.Year.length === 0 || filters.Year.includes(movie.year);

    return genreOk && ratingOk && yearOk;
  });

  return (
    <div className="app">
      <h1>🎬 Movie Filter App</h1>
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
      <MovieList movies={filteredMovies} />
    </div>
  );
}
