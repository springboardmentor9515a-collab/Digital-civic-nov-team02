import React, { useState } from "react";

const chips = [
  "All Categories",
  "Environment",
  "Infrastructure",
  "Education",
  "Public Safety",
  "Transportation",
  "Healthcare",
  "Housing",
];

export default function FilterChips() {
  // ✅ MULTI-SELECT STATE
  const [activeFilters, setActiveFilters] = useState(["All Categories"]);

  const toggleFilter = (filter) => {
    // If "All Categories" is clicked → reset everything
    if (filter === "All Categories") {
      setActiveFilters(["All Categories"]);
      return;
    }

    setActiveFilters((prev) => {
      // Remove "All Categories" when selecting others
      const withoutAll = prev.filter((f) => f !== "All Categories");

      // Toggle logic
      if (withoutAll.includes(filter)) {
        const updated = withoutAll.filter((f) => f !== filter);
        // If nothing left, fallback to "All Categories"
        return updated.length ? updated : ["All Categories"];
      } else {
        return [...withoutAll, filter];
      }
    });
  };

  return (
    <div className="fc-root">
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => toggleFilter(chip)}
          className={`chip ${
            activeFilters.includes(chip) ? "chip-active" : ""
          }`}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
