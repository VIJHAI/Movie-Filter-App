import React from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
