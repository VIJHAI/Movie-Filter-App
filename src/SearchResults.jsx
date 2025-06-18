// src/components/SearchResults.jsx

import React from "react";

export default function SearchResults({ results }) {
  if (!results) return null;

  return (
    <div className="results">
      <h3>Search Results</h3>
      {["movies", "actors", "tvShows"].map((type) => (
        <div key={type}>
          <h4>{type.toUpperCase()}</h4>
          <ul>
            {results[type].map((item) => (
              <li key={item.id}>{item.title || item.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
