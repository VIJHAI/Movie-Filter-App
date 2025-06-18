import React from "react";
import { motion } from "framer-motion";

export default function FilterChips({ label, options, selected, onToggle }) {
  return (
    <div className="chip-group">
      <h3 className="chip-title">Filter by {label}</h3>
      <div className="chips">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <motion.button
              key={option}
              className={`chip ${isSelected ? "selected" : ""}`}
              onClick={() => onToggle(label, option)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              layout
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
