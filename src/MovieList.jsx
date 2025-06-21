import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewSection from "./ReviewSection"; // ✅ Import ReviewSection

export default function MovieList({ movies }) {
  return (
    <div className="movie-list">
      <AnimatePresence>
        {movies.map((movie) => (
          <motion.div
            key={movie.id}
            className="movie-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
          >
            <h3>{movie.title}</h3>
            <p><strong>Genre:</strong> {movie.genre}</p>
            <p><strong>Rating:</strong> {movie.rating}</p>
            <p><strong>Year:</strong> {movie.year}</p>

            {/* ✅ Add review section below the movie details */}
            <ReviewSection movieId={movie.id} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
