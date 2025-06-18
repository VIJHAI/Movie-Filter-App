// src/mockSearchApi.js

export function mockSearch(query) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lower = query.toLowerCase();

      const movies = [
        { id: 1, title: "Inception", genre: "Sci-Fi", rating: "8.8", year: 2010 },
        { id: 2, title: "Interstellar", genre: "Sci-Fi", rating: "8.6", year: 2014 },
        { id: 3, title: "Titanic", genre: "Romance", rating: "7.8", year: 1997 },
      ];

      const actors = [
        { id: 101, name: "Leonardo DiCaprio" },
        { id: 102, name: "Matthew McConaughey" },
        { id: 103, name: "Kate Winslet" },
      ];

      const shows = [
        { id: 201, title: "Breaking Bad", year: 2008 },
        { id: 202, title: "Stranger Things", year: 2016 },
        { id: 203, title: "Dark", year: 2017 },
      ];

      resolve({
        movies: movies.filter((m) => m.title.toLowerCase().includes(lower)),
        actors: actors.filter((a) => a.name.toLowerCase().includes(lower)),
        shows: shows.filter((s) => s.title.toLowerCase().includes(lower)),
      });
    }, 500); // Simulate 500ms network delay
  });
}
