// Signal0.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { FiSearch, FiFilter, FiHeart } from "react-icons/fi";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { BiBook } from "react-icons/bi";

/**
 * Signal0 - Problem browser / explorer page
 * Uses your CSS variables:
 *   --bg-page, --card-bg, --card-bg-2, --panel-border, --text-default,
 *   --text-muted, --brand, --warning, --danger, --success
 */

const SAMPLE = Array.from({ length: 18 }).map((_, i) => {
  const diffs = ["easy", "medium", "hard"];
  const cats = [
    "Machine Learning",
    "Statistics",
    "Image Processing",
    "Reinforcement Learning",
    "Linear Algebra",
  ];
  const d = diffs[i % diffs.length];
  const c = cats[i % cats.length];
  return {
    id: 300 + i,
    title:
      d === "easy"
        ? "Implement the Sigmoid Activation Function"
        : i % 2
        ? "Implement Linear Regression Fitting"
        : "Implement 2D Convolution for Feature Extraction",
    difficulty: d,
    category: c,
    tags: [c.split(" ")[0], d === "easy" ? "PyTorch" : "NumPy"],
  };
});

function difficultyColor(diff) {
  if (diff === "easy") return "bg-[var(--success)] text-[var(--bg-page)]";
  if (diff === "medium") return "bg-[var(--color-warning)] text-[var(--bg-page)]";
  return "bg-[var(--danger)] text-[var(--bg-page)]";
}

export default function Signal0() {
  const [query, setQuery] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState(new Set());
  const filterRef = useRef(null);
  const filterBtnRef = useRef(null);

  const problems = SAMPLE;

  // close filter when clicking outside
  useEffect(() => {
    const handle = (e) => {
      if (
        openFilter &&
        filterRef.current &&
        !filterRef.current.contains(e.target) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target)
      ) {
        setOpenFilter(false);
      }
    };
    window.addEventListener("mousedown", handle);
    return () => window.removeEventListener("mousedown", handle);
  }, [openFilter]);

  const toggleDiff = (d) => {
    const s = new Set(selectedDifficulties);
    if (s.has(d)) s.delete(d);
    else s.add(d);
    setSelectedDifficulties(s);
  };

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (selectedDifficulties.size > 0 && !selectedDifficulties.has(p.difficulty))
        return false;
      if (!query) return true;
      return p.title.toLowerCase().includes(query.toLowerCase());
    });
  }, [problems, query, selectedDifficulties]);

  return (
    <div className="font-mono min-h-screen w-full relative bg-[var(--color-bg-black)] text-[var(--text-default)]">
      {/* subtle background grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "64px 64px, 64px 64px",
          opacity: 0.6,
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28">
        {/* Search + Filter */}
        <div className="flex flex-col lg:flex-row items-start gap-4">
          <div className="flex-1 w-full ">
            <label htmlFor="signal-search" className="sr-only  ">
              Search questions and collections
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-[var(--color-fg)]">
                <FiSearch />
              </span>
              <input
                id="signal-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions and collections..."
                className="w-full rounded-xl py-3 sm:py-3 pl-12 pr-4 bg-[var(--color-bg-black)] border border-[var(--color-muted)] text-[var(--text-default)] placeholder:text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition"
                aria-label="Search questions and collections"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
           

            <div className="relative">
              <button
                ref={filterBtnRef}
                onClick={() => setOpenFilter((s) => !s)}
                aria-expanded={openFilter}
                aria-controls="signal-filter"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-[var(--card-bg)] border border-[var(--panel-border)] text-[var(--text-default)] hover:bg-[var(--card-bg-2)] transition focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              >
                <FiFilter /> <span className="hidden sm:inline">Filter</span>
              </button>

              {openFilter && (
                <div
                  ref={filterRef}
                  id="signal-filter"
                  className="absolute right-0 mt-2 w-64 bg-[var(--card-bg)] border border-[var(--panel-border)] rounded-lg shadow-lg p-3 z-20"
                >
                  <div className="text-sm font-medium mb-2 text-[var(--text-default)]">Difficulty</div>
                  <div className="flex flex-col gap-2">
                    {["easy", "medium", "hard"].map((d) => (
                      <label key={d} className="inline-flex items-center gap-2 text-sm select-none">
                        <input
                          type="checkbox"
                          checked={selectedDifficulties.has(d)}
                          onChange={() => toggleDiff(d)}
                          className="h-4 w-4 rounded bg-[var(--card-bg)] border border-[var(--panel-border)] accent-[var(--brand)]"
                        />
                        <span className="capitalize text-[var(--text-default)]">{d}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-between">
                    <button
                      onClick={() => {
                        setSelectedDifficulties(new Set());
                        setOpenFilter(false);
                      }}
                      className="text-sm px-3 py-1 rounded bg-[var(--card-bg-2)] border border-[var(--panel-border)] text-[var(--text-default)]"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setOpenFilter(false)}
                      className="text-sm px-3 py-1 rounded bg-[var(--brand)] text-[var(--bg-page)]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Count + subtitle */}
        <div className="mt-6 text-[var(--color-fg)]">{filtered.length} items ({problems.length} questions + collections)</div>

        {/* Responsive Grid */}
        <section className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <article
                key={p.id}
                className="relative rounded-xl p-5 bg-[var(--card-bg)] border border-[var(--panel-border)] shadow-sm hover:shadow-lg transition focus-within:ring-2 focus-within:ring-[var(--brand)]"
                tabIndex={0}
                aria-labelledby={`title-${p.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${difficultyColor(
                          p.difficulty
                        )}`}
                        aria-hidden
                      >
                        {p.difficulty}
                      </span>

                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--card-bg-2)] border border-[var(--panel-border)] text-[var(--color-fg)]">
                        {p.category}
                      </span>
                    </div>

                    <h3
                      id={`title-${p.id}`}
                      className="text-[1.03rem] sm:text-[1.05rem] font-semibold tracking-tight text-[var(--text-default)] mb-2"
                      // cross-browser multiline ellipsis (works without line-clamp plugin)
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.title}
                    </h3>

                    <div className="text-xs text-[var(--color-fg)]">#{p.id}</div>
                  </div>

                  <div className="flex-shrink-0 flex items-start">
                    <button
                      className="p-2 rounded-md text-[var(--color-fg)] hover:text-[var(--brand)] transition focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                      title="Like"
                      aria-label={`Like problem ${p.id}`}
                    >
                      <FiHeart />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky bottom bar */}
      {/* <footer className="fixed bottom-4 left-0 right-0 pointer-events-auto z-40 flex items-center justify-center px-4">
        <div className="mx-auto max-w-7xl w-full">
          <div className="rounded-2xl bg-[var(--color-elevated)] border border-[var(--color-muted)] p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm text-[var(--color-fg)]">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[var(--card-bg-2)] border border-[var(--panel-border)] text-[var(--text-default)]">
                <span>Signal-0</span>
              </div>
              <div className="text-[var(--color-fg)]">3/3 lifetime remaining</div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-3 py-2 rounded-md bg-[var(--card-bg-2)] border border-[var(--panel-border)] text-[var(--color-fg)] hover:text-[var(--text-default)]">
                <BiBook /> <span className="hidden sm:inline ml-2">Browse</span>
              </button>
              <button className="px-3 py-2 rounded-md bg-[var(--brand)] text-[var(--bg-page)] hover:brightness-105">
                <HiOutlineSquares2X2 /> <span className="hidden sm:inline ml-2">Generate</span>
              </button>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
