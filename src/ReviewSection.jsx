import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AUTOSAVE_DELAY = 300;

const ReviewSection = ({ movieId }) => {
  const [reviews, setReviews] = useState(() =>
    JSON.parse(localStorage.getItem(`reviews-${movieId}`)) || []
  );
  const [draft, setDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [sortBy, setSortBy] = useState("recent");

  // Load draft on mount or movieId change
  useEffect(() => {
    const savedDraft = localStorage.getItem(`draft-${movieId}`);
    setDraft(savedDraft || "");
  }, [movieId]);

  // Autosave draft
  useEffect(() => {
    const saveDraft = setTimeout(() => {
      localStorage.setItem(`draft-${movieId}`, draft);
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(saveDraft);
  }, [draft, movieId]);

  const saveReviews = (newReviews) => {
    setReviews(newReviews);
    localStorage.setItem(`reviews-${movieId}`, JSON.stringify(newReviews));
  };

  const handleSubmit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    if (editingIndex !== null) {
      const updated = [...reviews];
      updated[editingIndex].text = trimmed;
      saveReviews(updated);
      setEditingIndex(null);
    } else {
      const newReview = {
        text: trimmed,
        time: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
      };
      saveReviews([newReview, ...reviews]);
    }

    setDraft("");
    localStorage.removeItem(`draft-${movieId}`);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setDraft(reviews[index].text);
  };

  const handleDelete = (index) => {
    const updated = [...reviews];
    updated.splice(index, 1);
    saveReviews(updated);
    setEditingIndex(null);
    setDraft("");
  };

  const handleVote = (index, type) => {
    const updated = [...reviews];
    if (type === "up") updated[index].upvotes++;
    else updated[index].downvotes++;
    saveReviews(updated);
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.time) - new Date(a.time);
    const aHelp = a.upvotes - a.downvotes;
    const bHelp = b.upvotes - b.downvotes;
    return bHelp - aHelp;
  });

  return (
    <div className="review-box">
      <h3>📝 Reviews</h3>

      <textarea
        placeholder="Write your review..."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />

      <button onClick={handleSubmit}>
        {editingIndex !== null ? "Update Review" : "Post Review"}
      </button>

      <div className="sort-toggle">
        Sort by:{" "}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      <AnimatePresence>
        {sortedReviews.map((r, i) => (
          <motion.div
            key={r.time}
            className="review"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            layout
          >
            <p>{r.text}</p>
            <div className="review-meta">
              <small>{new Date(r.time).toLocaleString()}</small>
              <div className="actions">
                <button onClick={() => handleVote(i, "up")} aria-label="Upvote">
                  👍 {r.upvotes}
                </button>
                <button onClick={() => handleVote(i, "down")} aria-label="Downvote">
                  👎 {r.downvotes}
                </button>
                <button onClick={() => handleEdit(i)} aria-label="Edit">
                  ✏️
                </button>
                <button onClick={() => handleDelete(i)} aria-label="Delete">
                  🗑️
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ReviewSection;
